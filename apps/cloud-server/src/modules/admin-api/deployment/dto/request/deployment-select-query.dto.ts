import { ApiPropertyOptional } from '@nestjs/swagger';
import { SelectOptionsQueryDto } from '@vritti/api-sdk/database';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class DeploymentSelectQueryDto extends SelectOptionsQueryDto {
  @ApiPropertyOptional({ description: 'Filter by region ID' })
  @IsOptional()
  @IsUUID()
  regionId?: string;

  @ApiPropertyOptional({ description: 'Filter by cloud provider ID' })
  @IsOptional()
  @IsUUID()
  cloudProviderId?: string;

  @ApiPropertyOptional({ description: 'Filter by app version string' })
  @IsOptional()
  @IsString()
  version?: string;
}
