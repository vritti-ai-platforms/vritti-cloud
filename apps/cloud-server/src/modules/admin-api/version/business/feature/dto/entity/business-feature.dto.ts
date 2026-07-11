import type { BusinessFeatureRow } from '@domain/version/business/app/app-feature/repositories/app-feature.repository';
import { ApiProperty } from '@nestjs/swagger';
import { type ScopeType, ScopeTypeValues, type SiteApplies, SiteAppliesValues } from '@/db/schema/enums';

export class BusinessFeatureAppDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'Catalog Management' })
  name: string;
}

export class BusinessFeatureDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'inventory-items' })
  code: string;

  @ApiProperty({ example: 'Inventory Items' })
  name: string;

  @ApiProperty({ example: 'package' })
  lucideIcon: string;

  @ApiProperty({ enum: ScopeTypeValues, example: 'SITE' })
  scope: ScopeType;

  @ApiProperty({ enum: SiteAppliesValues, isArray: true, example: ['OUTLET'] })
  applicableSiteTypes: SiteApplies[];

  @ApiProperty({ type: BusinessFeatureAppDto })
  app: BusinessFeatureAppDto;

  @ApiProperty({ example: 4, description: 'Number of permissions applicable to this business' })
  permissionCount: number;

  // Maps a business-feature table row to a BusinessFeatureDto
  static from(row: BusinessFeatureRow): BusinessFeatureDto {
    const dto = new BusinessFeatureDto();
    dto.id = row.id;
    dto.code = row.code;
    dto.name = row.name;
    dto.lucideIcon = row.lucideIcon;
    dto.scope = row.scope;
    dto.applicableSiteTypes = row.applicableSiteTypes;
    dto.app = row.app;
    dto.permissionCount = row.permissionCount;
    return dto;
  }
}
