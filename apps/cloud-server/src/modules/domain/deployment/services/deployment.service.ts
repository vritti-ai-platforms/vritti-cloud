import { DEPLOYMENT_DESIRED_STATE_CHANGED_EVENT } from '@domain/deployment-agent/deployment-agent.constants';
import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateResponseDto, type SelectQueryResult, SuccessResponseDto } from '@vritti/api-sdk/database';
import { BadRequestException, ConflictException, NotFoundException } from '@vritti/api-sdk/exceptions';
import { generateSigningKeyPair } from '@vritti/api-sdk/signing';
import {
  type DeploymentManagementType,
  DeploymentManagementTypeValues,
  type DeploymentSpec,
  DeploymentStatusValues,
  DeploymentTenantTypeValues,
} from '@/db/schema';
import { DeploymentDto } from '@/modules/admin-api/deployment/dto/entity/deployment.dto';
import type { SigningKeyDto } from '@/modules/admin-api/deployment/dto/entity/signing-key.dto';
import type { ComponentsInputDto } from '@/modules/admin-api/deployment/dto/request/components-input.dto';
import type { CreateDeploymentDto } from '@/modules/admin-api/deployment/dto/request/create-deployment.dto';
import type { DeploymentSelectQueryDto } from '@/modules/admin-api/deployment/dto/request/deployment-select-query.dto';
import type { UpdateDeploymentDto } from '@/modules/admin-api/deployment/dto/request/update-deployment.dto';
import { DeploymentsResponseDto } from '@/modules/admin-api/deployment/dto/response/deployments-response.dto';
import type {
  DeploymentFilterDto,
  DeploymentPlanQueryDto,
} from '@/modules/cloud-api/deployment/dto/request/deployment-filter.dto';
import type { DeploymentOptionDto } from '@/modules/cloud-api/deployment/dto/response/deployment-option.dto';
import type { PlanOptionDto } from '@/modules/cloud-api/deployment/dto/response/plan-option.dto';
import { CryptoService } from '@/services';
import { LOCAL_CLOUD_PROVIDER_ID, LOCAL_REGION_ID } from '../local-deployment.constants';
import { DeploymentDomainRepository } from '../repositories/deployment.repository';

// Reserved prefix for secret-store auth secret params carried in deployment_secrets
const SECRET_PROVIDER_SECRET_PREFIX = 'secretStore.';

@Injectable()
export class DeploymentDomainService {
  private readonly logger = new Logger(DeploymentDomainService.name);

  constructor(
    private readonly deploymentRepository: DeploymentDomainRepository,
    private readonly cryptoService: CryptoService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // Signals that a deployment's desired-state may have changed so any open agent Subscribe stream
  // re-evaluates and pushes immediately (the stream also re-checks on its keepalive cadence as a backstop).
  private notifyDesiredStateChanged(deploymentId: string): void {
    this.eventEmitter.emit(DEPLOYMENT_DESIRED_STATE_CHANGED_EVENT, deploymentId);
  }

  // Returns paginated deployment options for the select component, with optional region and cloud provider filters
  findForSelect(query: DeploymentSelectQueryDto): Promise<SelectQueryResult> {
    this.logger.log(
      `Fetched deployment select options (limit: ${query.limit}, offset: ${query.offset}, search: ${query.search})`,
    );
    return this.deploymentRepository.findForSelect({
      value: query.valueKey || 'id',
      label: query.labelKey || 'name',
      description: query.descriptionKey,
      groupIdKey: query.groupIdKey,
      search: query.search,
      limit: query.limit,
      offset: query.offset,
      values: query.values,
      excludeIds: query.excludeIds,
      orderBy: { name: 'asc' },
      where: {
        ...(query.regionId ? { regionId: query.regionId } : {}),
        ...(query.cloudProviderId ? { cloudProviderId: query.cloudProviderId } : {}),
        ...(query.version ? { version: query.version } : {}),
      },
    });
  }

  // Creates a new deployment without a signing key; manual deployments use the sentinel local region/provider
  async create(dto: CreateDeploymentDto): Promise<CreateResponseDto<DeploymentDto>> {
    const isManaged = dto.managementType === DeploymentManagementTypeValues.managed;
    const spec = this.buildSpec(dto.managementType, dto.components);
    this.validateSpec(dto.managementType, spec);
    const deployment = await this.deploymentRepository.create({
      name: dto.name,
      url: dto.url,
      version: dto.version,
      managementType: dto.managementType,
      spec,
      tenantType: dto.tenantType ?? DeploymentTenantTypeValues.dedicated,
      regionId: dto.regionId ?? LOCAL_REGION_ID,
      cloudProviderId: dto.cloudProviderId ?? LOCAL_CLOUD_PROVIDER_ID,
      status: dto.status ?? (isManaged ? DeploymentStatusValues.Provisioning : DeploymentStatusValues.active),
      signingKey: null,
      signingPublicKey: null,
    });
    await this.writeSecretProviderSecrets(deployment.id, dto.secretProviderSecrets);
    this.logger.log(`Created deployment: ${deployment.name} (${deployment.id})`);
    return {
      success: true,
      message: `Deployment "${deployment.name}" created successfully.`,
      data: DeploymentDto.from(deployment),
    };
  }

  // Builds the initial spec from the create DTO — manual deployments get an empty spec, managed get their components
  private buildSpec(managementType: DeploymentManagementType, input: ComponentsInputDto | undefined): DeploymentSpec {
    if (managementType !== DeploymentManagementTypeValues.managed) {
      return { specVersion: 1, components: {} };
    }
    const derived = this.componentsFromInput(input ?? {});
    // core is always present on a managed deployment (defaults enabled); explicit input still overrides
    return { specVersion: 1, components: { core: { enabled: true }, ...derived } };
  }

  // Merges a partial component input into the existing spec, replacing each provided component wholesale
  private mergeSpec(
    existing: DeploymentSpec,
    managementType: DeploymentManagementType,
    input: ComponentsInputDto | undefined,
  ): DeploymentSpec {
    if (managementType !== DeploymentManagementTypeValues.managed) {
      return { specVersion: 1, components: {} };
    }
    if (!input) return existing;
    return { specVersion: 1, components: { ...existing.components, ...this.componentsFromInput(input) } };
  }

  // Projects a component input onto the stored spec-components shape, including only the components present
  private componentsFromInput(input: ComponentsInputDto): DeploymentSpec['components'] {
    const components: DeploymentSpec['components'] = {};
    if (input.core !== undefined) {
      components.core = { enabled: input.core.enabled ?? true };
    }
    if (input.database !== undefined) {
      components.database = {
        mode: input.database.mode,
        ...(input.database.backup ? { backup: { retention: input.database.backup.retention } } : {}),
      };
    }
    if (input.edge !== undefined) {
      components.edge = { mode: input.edge.mode, ...(input.edge.acmeEmail ? { acmeEmail: input.edge.acmeEmail } : {}) };
    }
    if (input.gitea !== undefined) {
      components.gitea = { enabled: input.gitea.enabled };
    }
    if (input.secretStore !== undefined) {
      components.secretStore = {
        type: input.secretStore.type,
        url: input.secretStore.url,
        projectId: input.secretStore.projectId,
        env: input.secretStore.env,
        auth: { method: input.secretStore.auth.method, params: input.secretStore.auth.params },
      };
    }
    return components;
  }

  // Enforces cross-component requirements for managed deployments only; manual deployments are unaffected
  private validateSpec(managementType: DeploymentManagementType, spec: DeploymentSpec): void {
    if (managementType !== DeploymentManagementTypeValues.managed) return;
    const components = spec.components;
    const errors: { field: string; message: string }[] = [];
    // NOTE: secretStore is deliberately NOT required at create/update time — it is configured during the
    // in-view setup flow (it's a provisioning prerequisite the agent needs, alongside enroll), and the
    // agent reports an `AwaitingSecretStore` Blocked condition until it is set. See the deployment setup flow.
    // A managed edge issues a single *.<base> wildcard via Let's Encrypt, so it needs an ACME registration email.
    if (components.edge?.mode === 'managed' && !components.edge.acmeEmail) {
      errors.push({ field: 'components.edge.acmeEmail', message: 'ACME email required' });
    }
    // pgBackRest backs up the agent-run Postgres, so it's only valid with a managed database.
    if (components.database?.backup && components.database.mode !== 'managed') {
      errors.push({ field: 'components.database.backup', message: 'Requires a managed database' });
    }
    if (errors.length === 0) return;
    throw new BadRequestException({
      label: 'Incomplete Managed Deployment',
      detail:
        'Managed deployments need a secret store, a managed edge needs an ACME email for its wildcard certificate, and pgBackRest requires a managed database.',
      errors,
    });
  }

  // Regenerates the deployment's signing keypair and returns the new public key
  async regenerateSigningKey(id: string): Promise<CreateResponseDto<SigningKeyDto>> {
    const existing = await this.deploymentRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Deployment not found.');
    }
    const { privateKey, publicKey } = generateSigningKeyPair();
    await this.deploymentRepository.update(id, { signingKey: privateKey, signingPublicKey: publicKey });
    // LICENSE_PUBLIC_KEY rides the desired-state config — the agent needs the new key pushed to it
    this.notifyDesiredStateChanged(id);
    this.logger.log(`Regenerated signing key for deployment: ${existing.name} (${id})`);
    return {
      success: true,
      message: `Signing key for "${existing.name}" regenerated successfully.`,
      data: { deploymentId: id, publicKey },
    };
  }

  // Returns all deployments mapped to DTOs
  async findAll(): Promise<DeploymentsResponseDto> {
    const deployments = await this.deploymentRepository.findAll();
    const result = deployments.map((deployment) => DeploymentDto.from(deployment));
    this.logger.log(`Fetched all deployments (${result.length})`);
    return { result, count: result.length };
  }

  // Finds a deployment by ID with organization count; throws NotFoundException if not found
  async findById(id: string): Promise<DeploymentDto> {
    const [deployment, organizationCount] = await Promise.all([
      this.deploymentRepository.findById(id),
      this.deploymentRepository.countOrganizationsByDeploymentId(id),
    ]);
    if (!deployment) {
      throw new NotFoundException('Deployment not found.');
    }
    this.logger.log(`Fetched deployment: ${id}`);
    return DeploymentDto.from(deployment, organizationCount);
  }

  // Updates a deployment by ID; merges any partial component input into the spec. Throws NotFoundException if not found
  async update(id: string, dto: UpdateDeploymentDto): Promise<SuccessResponseDto> {
    const existing = await this.deploymentRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Deployment not found.');
    }
    // components + secretProviderSecrets are not plain columns — the former folds into the spec jsonb, the latter rides deployment_secrets
    const { components, secretProviderSecrets, ...columns } = dto;
    const managementType = columns.managementType ?? existing.managementType;
    const spec = this.mergeSpec(existing.spec, managementType, components);
    this.validateSpec(managementType, spec);
    const deployment = await this.deploymentRepository.update(id, { ...columns, spec });
    await this.writeSecretProviderSecrets(id, secretProviderSecrets);
    // Spec/version/secret-store changed — push the new desired-state to the agent instantly
    this.notifyDesiredStateChanged(id);
    this.logger.log(`Updated deployment: ${deployment.name} (${deployment.id})`);
    return { success: true, message: `Deployment "${deployment.name}" updated successfully.` };
  }

  // Encrypts each secret-store auth param at rest and upserts it into deployment_secrets under the reserved prefix
  private async writeSecretProviderSecrets(deploymentId: string, secrets?: Record<string, string>): Promise<void> {
    if (!secrets) return;
    for (const [name, value] of Object.entries(secrets)) {
      const encrypted = this.cryptoService.encrypt(value);
      await this.deploymentRepository.upsertSecret(deploymentId, `${SECRET_PROVIDER_SECRET_PREFIX}${name}`, encrypted);
    }
    this.logger.log(`Stored ${Object.keys(secrets).length} secret-provider secret(s) for deployment ${deploymentId}`);
  }

  // Deletes a deployment by ID; throws NotFoundException if not found, ConflictException if orgs reference it
  async delete(id: string): Promise<SuccessResponseDto> {
    const existing = await this.deploymentRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Deployment not found.');
    }
    const orgCount = await this.deploymentRepository.countOrganizationsByDeploymentId(id);
    if (orgCount > 0) {
      throw new ConflictException({
        label: 'Deployment In Use',
        detail: `This deployment is used by ${orgCount} organization${orgCount !== 1 ? 's' : ''}. Remove all associated organizations before deleting.`,
      });
    }
    await this.deploymentRepository.delete(id);
    this.logger.log(`Deleted deployment: ${existing.name} (${existing.id})`);
    return { success: true, message: `Deployment "${existing.name}" deleted successfully.` };
  }

  // Returns active deployments for the given region, provider, and business combo
  findActive(query: DeploymentFilterDto): Promise<DeploymentOptionDto[]> {
    this.logger.log(
      `Fetched active deployments (region: ${query.regionId}, provider: ${query.cloudProviderId}, business: ${query.businessId})`,
    );
    return this.deploymentRepository.findActive(query.regionId, query.cloudProviderId, query.businessId);
  }

  // Returns plans available on a deployment for the given business, priced for the given country
  findPlansForDeployment(deploymentId: string, query: DeploymentPlanQueryDto): Promise<PlanOptionDto[]> {
    if (!query.businessId) return Promise.resolve([]);
    this.logger.log(
      `Fetched plans for deployment: ${deploymentId} (business: ${query.businessId}, country: ${query.countryId})`,
    );
    return this.deploymentRepository.findPlansForDeployment(deploymentId, query.businessId, query.countryId);
  }
}
