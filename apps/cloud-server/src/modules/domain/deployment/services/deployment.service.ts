import { Injectable, Logger } from '@nestjs/common';
import { CreateResponseDto, type SelectQueryResult, SuccessResponseDto } from '@vritti/api-sdk/database';
import { ConflictException, NotFoundException } from '@vritti/api-sdk/exceptions';
import { generateSigningKeyPair } from '@vritti/api-sdk/signing';
import { DeploymentManagementModeValues, DeploymentStatusValues, DeploymentTypeValues } from '@/db/schema';
import { DeploymentDto } from '@/modules/admin-api/deployment/dto/entity/deployment.dto';
import type { SigningKeyDto } from '@/modules/admin-api/deployment/dto/entity/signing-key.dto';
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
import { LOCAL_CLOUD_PROVIDER_ID, LOCAL_REGION_ID } from '../local-deployment.constants';
import { DeploymentDomainRepository } from '../repositories/deployment.repository';

@Injectable()
export class DeploymentDomainService {
  private readonly logger = new Logger(DeploymentDomainService.name);

  constructor(private readonly deploymentRepository: DeploymentDomainRepository) {}

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
    const isManual = dto.managementMode === DeploymentManagementModeValues.manual;
    const deployment = await this.deploymentRepository.create({
      name: dto.name,
      url: dto.url,
      version: dto.version,
      managementMode: dto.managementMode,
      type: dto.type ?? DeploymentTypeValues.dedicated,
      regionId: dto.regionId ?? LOCAL_REGION_ID,
      cloudProviderId: dto.cloudProviderId ?? LOCAL_CLOUD_PROVIDER_ID,
      status: dto.status ?? (isManual ? DeploymentStatusValues.active : DeploymentStatusValues.Provisioning),
      signingKey: null,
      signingPublicKey: null,
    });
    this.logger.log(`Created deployment: ${deployment.name} (${deployment.id})`);
    return {
      success: true,
      message: `Deployment "${deployment.name}" created successfully.`,
      data: DeploymentDto.from(deployment),
    };
  }

  // Regenerates the deployment's signing keypair and returns the new public key
  async regenerateSigningKey(id: string): Promise<CreateResponseDto<SigningKeyDto>> {
    const existing = await this.deploymentRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Deployment not found.');
    }
    const { privateKey, publicKey } = generateSigningKeyPair();
    await this.deploymentRepository.update(id, { signingKey: privateKey, signingPublicKey: publicKey });
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

  // Updates a deployment by ID; throws NotFoundException if not found
  async update(id: string, dto: UpdateDeploymentDto): Promise<SuccessResponseDto> {
    const existing = await this.deploymentRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Deployment not found.');
    }
    const deployment = await this.deploymentRepository.update(id, dto);
    this.logger.log(`Updated deployment: ${deployment.name} (${deployment.id})`);
    return { success: true, message: `Deployment "${deployment.name}" updated successfully.` };
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
