import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Trim } from '@vritti/api-sdk/decorators';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {
  type DeploymentDbMode,
  DeploymentDbModeValues,
  type DeploymentManagementMode,
  DeploymentManagementModeValues,
  type DeploymentStatus,
  DeploymentStatusValues,
  type DeploymentType,
  DeploymentTypeValues,
} from '@/db/schema';
import { DomainInputDto } from './domain-input.dto';
import { SecretProviderInputDto } from './secret-provider-input.dto';

export class CreateDeploymentDto {
  @ApiProperty({ description: 'Display name of the deployment', example: 'US East Production' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Base URL of the core instance', example: 'https://nexus-us-east.vritti.io' })
  @IsString()
  @IsUrl({ require_tld: false })
  @MaxLength(500)
  url: string;

  @ApiProperty({ enum: DeploymentManagementModeValues, description: 'How the deployment is operated' })
  @IsEnum(DeploymentManagementModeValues)
  managementMode: DeploymentManagementMode;

  @ApiPropertyOptional({ description: 'Region UUID — required for agent-managed deployments' })
  @ValidateIf((o) => o.managementMode === DeploymentManagementModeValues.agent)
  @IsUUID()
  regionId?: string;

  @ApiPropertyOptional({ description: 'Cloud provider UUID — required for agent-managed deployments' })
  @ValidateIf((o) => o.managementMode === DeploymentManagementModeValues.agent)
  @IsUUID()
  cloudProviderId?: string;

  @ApiPropertyOptional({ enum: DeploymentStatusValues, default: 'Provisioning', description: 'Deployment status' })
  @IsOptional()
  @IsEnum(DeploymentStatusValues)
  status?: DeploymentStatus;

  @ApiPropertyOptional({
    enum: DeploymentTypeValues,
    description: 'Deployment type — defaults to dedicated for manual',
  })
  @IsOptional()
  @IsEnum(DeploymentTypeValues)
  type?: DeploymentType;

  @ApiPropertyOptional({
    enum: DeploymentDbModeValues,
    default: 'managed',
    description:
      'DB provisioning mode — managed = agent runs its own Postgres; external = agent connects to an existing DB',
  })
  @IsOptional()
  @IsEnum(DeploymentDbModeValues)
  mode?: DeploymentDbMode;

  @ApiProperty({ description: 'App version string this deployment runs', example: '1.0.0' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  version: string;

  @ApiPropertyOptional({
    description: "Let's Encrypt registration email for the managed edge — agent/managed-edge deployments only",
    example: 'ops@vrittiai.com',
  })
  @IsOptional()
  @IsEmail()
  @Trim()
  acmeEmail?: string;

  @ApiPropertyOptional({
    type: [DomainInputDto],
    description: 'Managed-edge hosts + upstreams — agent/managed-edge deployments only',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DomainInputDto)
  domains?: DomainInputDto[];

  @ApiPropertyOptional({
    type: SecretProviderInputDto,
    description: 'Non-secret secret-store config pushed to the agent — agent-managed deployments only',
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SecretProviderInputDto)
  secretProvider?: SecretProviderInputDto;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: { type: 'string' },
    description:
      'Secret auth params (client secret, token, jwt, password, …); each is encrypted at rest and stored as secretProvider.<key> — write-only, never returned',
    example: { clientSecret: 'st.…' },
  })
  @IsOptional()
  @IsObject()
  @Type(() => Object)
  secretProviderSecrets?: Record<string, string>;
}
