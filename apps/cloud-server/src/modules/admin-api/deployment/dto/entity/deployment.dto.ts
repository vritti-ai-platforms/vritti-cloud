import type { DeploymentWithNames } from '@domain/deployment/repositories/deployment.repository';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Deployment } from '@/db/schema';
import {
  type DeploymentDbMode,
  DeploymentDbModeValues,
  type DeploymentEdge,
  DeploymentEdgeValues,
  type DeploymentManagementMode,
  DeploymentManagementModeValues,
  type DeploymentStatus,
  DeploymentStatusValues,
  type DeploymentType,
  DeploymentTypeValues,
} from '@/db/schema';
import { DomainInputDto } from '../request/domain-input.dto';
import { SecretProviderDto } from './secret-provider.dto';

export class DeploymentDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'US East Production' })
  name: string;

  @ApiProperty({ example: 'https://nexus-us-east.vritti.io' })
  url: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  regionId: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  cloudProviderId: string;

  @ApiProperty({ enum: DeploymentStatusValues })
  status: DeploymentStatus;

  @ApiProperty({ enum: DeploymentTypeValues })
  type: DeploymentType;

  @ApiProperty({ enum: DeploymentManagementModeValues })
  managementMode: DeploymentManagementMode;

  @ApiProperty({ enum: DeploymentDbModeValues })
  mode: DeploymentDbMode;

  @ApiProperty({ enum: DeploymentEdgeValues })
  edge: DeploymentEdge;

  @ApiProperty({ example: false, description: 'pgBackRest add-on enabled' })
  addonPgbackrest: boolean;

  @ApiProperty({ example: false, description: 'Gitea add-on enabled' })
  addonGitea: boolean;

  @ApiPropertyOptional({ example: '1.0.0', nullable: true })
  version: string | null;

  @ApiPropertyOptional({ example: 'ops@vrittiai.com', nullable: true })
  acmeEmail: string | null;

  @ApiProperty({ type: [DomainInputDto], description: 'Managed-edge hosts + upstreams' })
  domains: Array<{ host: string; upstream: string }>;

  @ApiPropertyOptional({
    type: SecretProviderDto,
    nullable: true,
    description: 'Non-secret secret-store config for form prefill — the secret auth half is never returned',
  })
  secretProvider: SecretProviderDto | null;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiPropertyOptional({ type: 'string', format: 'date-time', nullable: true })
  updatedAt: Date | null;

  @ApiPropertyOptional({ example: 'US East' })
  regionName?: string;

  @ApiPropertyOptional({ example: 'us-east' })
  regionCode?: string;

  @ApiPropertyOptional({ example: 'Amazon Web Services' })
  cloudProviderName?: string;

  @ApiPropertyOptional({ example: 'aws' })
  cloudProviderCode?: string;

  @ApiProperty({ example: 0 })
  organizationCount: number;

  @ApiProperty({ example: true })
  hasSigningKey: boolean;

  @ApiProperty({ example: true })
  catalogSynced: boolean;

  @ApiPropertyOptional({
    example: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    nullable: true,
  })
  lastPushedHash: string | null;

  @ApiPropertyOptional({
    example: 'MCowBQYDK2VwAyEA0V5v0v9v0v9v0v9v0v9v0v9v0v9v0v9v0v9v0v9v0v8=',
    description:
      'Ed25519 signing public key (base64). Returned once on create/regenerate for manual deployments — shown once, then rotated if lost.',
  })
  publicKey?: string;

  // Maps a deployment row to the API shape — the license signing key is never exposed
  static from(deployment: Deployment | DeploymentWithNames, organizationCount = 0): DeploymentDto {
    const dto = new DeploymentDto();
    dto.id = deployment.id;
    dto.name = deployment.name;
    dto.url = deployment.url;
    dto.regionId = deployment.regionId;
    dto.cloudProviderId = deployment.cloudProviderId;
    dto.status = deployment.status;
    dto.type = deployment.type;
    dto.managementMode = deployment.managementMode;
    dto.mode = deployment.mode;
    dto.edge = deployment.edge;
    dto.addonPgbackrest = deployment.addonPgbackrest;
    dto.addonGitea = deployment.addonGitea;
    dto.version = deployment.version;
    dto.acmeEmail = deployment.acmeEmail;
    dto.domains = deployment.domains ?? [];
    dto.secretProvider = deployment.secretProvider ? SecretProviderDto.from(deployment.secretProvider) : null;
    dto.createdAt = deployment.createdAt;
    dto.updatedAt = deployment.updatedAt;
    dto.organizationCount = organizationCount;
    dto.hasSigningKey = deployment.signingPublicKey != null;
    dto.catalogSynced = deployment.lastPushedHash != null;
    dto.lastPushedHash = deployment.lastPushedHash;
    if ('region' in deployment && deployment.region) {
      const withNames = deployment as DeploymentWithNames;
      dto.regionName = withNames.region.name;
      dto.regionCode = withNames.region.code;
      dto.cloudProviderName = withNames.cloudProvider.name;
      dto.cloudProviderCode = withNames.cloudProvider.code;
    }
    return dto;
  }
}
