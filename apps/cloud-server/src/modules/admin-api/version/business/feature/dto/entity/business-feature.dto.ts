import type { BusinessFeatureRow } from '@domain/version/business/app/app-feature/repositories/app-feature.repository';
import { ApiProperty } from '@nestjs/swagger';

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
  icon: string;

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
    dto.icon = row.icon;
    dto.app = row.app;
    dto.permissionCount = row.permissionCount;
    return dto;
  }
}
