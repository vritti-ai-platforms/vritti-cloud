import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
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
  type DeploymentManagementType,
  DeploymentManagementTypeValues,
  type DeploymentStatus,
  DeploymentStatusValues,
  type DeploymentTenantType,
  DeploymentTenantTypeValues,
} from '@/db/schema';
import { ComponentsInputDto } from './components-input.dto';

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

  @ApiProperty({
    enum: DeploymentManagementTypeValues,
    description: 'Who runs the stack — managed (agent) or manual (self-hosted)',
  })
  @IsEnum(DeploymentManagementTypeValues)
  managementType: DeploymentManagementType;

  @ApiPropertyOptional({ description: 'Region UUID — required for managed deployments' })
  @ValidateIf((o) => o.managementType === DeploymentManagementTypeValues.managed)
  @IsUUID()
  regionId?: string;

  @ApiPropertyOptional({ description: 'Cloud provider UUID — required for managed deployments' })
  @ValidateIf((o) => o.managementType === DeploymentManagementTypeValues.managed)
  @IsUUID()
  cloudProviderId?: string;

  @ApiPropertyOptional({ enum: DeploymentStatusValues, default: 'Provisioning', description: 'Deployment status' })
  @IsOptional()
  @IsEnum(DeploymentStatusValues)
  status?: DeploymentStatus;

  @ApiPropertyOptional({
    enum: DeploymentTenantTypeValues,
    description: 'Deployment tenancy — defaults to dedicated',
  })
  @IsOptional()
  @IsEnum(DeploymentTenantTypeValues)
  tenantType?: DeploymentTenantType;

  @ApiProperty({ description: 'App version string this deployment runs', example: '1.0.0' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  version: string;

  @ApiPropertyOptional({
    type: ComponentsInputDto,
    description: 'Nested stack-component spec — managed deployments only; omit for manual',
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ComponentsInputDto)
  components?: ComponentsInputDto;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: { type: 'string' },
    description:
      'Secret-store auth params (client secret, token, jwt, password, …); each is encrypted at rest and stored as secretStore.<key> — write-only, never returned',
    example: { clientSecret: 'st.…' },
  })
  @IsOptional()
  @IsObject()
  @Type(() => Object)
  secretProviderSecrets?: Record<string, string>;
}
