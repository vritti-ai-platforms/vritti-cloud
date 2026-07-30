import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUrl, IsUUID, MaxLength, MinLength, ValidateIf } from 'class-validator';
import {
  type DeploymentManagementMode,
  DeploymentManagementModeValues,
  type DeploymentStatus,
  DeploymentStatusValues,
  type DeploymentType,
  DeploymentTypeValues,
} from '@/db/schema';

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

  @ApiProperty({ description: 'App version string this deployment runs', example: '1.0.0' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  version: string;
}
