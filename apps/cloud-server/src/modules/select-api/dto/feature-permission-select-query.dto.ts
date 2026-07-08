import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SelectOptionsQueryDto } from '@vritti/api-sdk/database';
import { IsOptional, IsUUID } from 'class-validator';

export class FeaturePermissionSelectQueryDto extends SelectOptionsQueryDto {
  @ApiProperty({ description: 'Feature whose permissions to list' })
  @IsUUID()
  featureId: string;

  @ApiPropertyOptional({ description: 'Filter by version ID' })
  @IsOptional()
  @IsUUID()
  versionId?: string;

  @ApiPropertyOptional({ description: 'Permission id to exclude (hides self when editing)' })
  @IsOptional()
  @IsUUID()
  excludeId?: string;
}
