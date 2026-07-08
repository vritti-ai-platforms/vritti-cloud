import { ApiPropertyOptional } from '@nestjs/swagger';
import { SelectOptionsQueryDto } from '@vritti/api-sdk/database';
import { IsOptional, IsUUID } from 'class-validator';

export class RoleTemplateSelectQueryDto extends SelectOptionsQueryDto {
  @ApiPropertyOptional({ description: 'Filter by version ID' })
  @IsOptional()
  @IsUUID()
  versionId?: string;

  @ApiPropertyOptional({ description: 'Filter by business ID' })
  @IsOptional()
  @IsUUID()
  businessId?: string;
}
