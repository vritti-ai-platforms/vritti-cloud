import type { FeaturePermissionTableRow } from '@domain/version/feature/feature-permission/repositories/feature-permission.repository';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FeaturePermissionDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  featureId: string;

  @ApiPropertyOptional({ example: 'Sales Catalogs', nullable: true, description: 'Owning feature name' })
  featureName: string | null;

  @ApiProperty({ example: 'add_salt' })
  code: string;

  @ApiProperty({ example: 'Add Salt' })
  label: string;

  @ApiProperty({ example: false, description: 'When true, applies to all businesses' })
  isGlobal: boolean;

  @ApiProperty({
    type: [String],
    example: ['550e8400-e29b-41d4-a716-446655440002'],
    description: 'Businesses this permission is linked to (empty when global)',
  })
  businessIds: string[];

  @ApiProperty({
    type: [String],
    example: ['550e8400-e29b-41d4-a716-446655440003'],
    description: 'Prerequisite sibling permission ids required before this one (empty when none)',
  })
  dependsOn: string[];

  @ApiProperty({
    type: [String],
    example: ['view'],
    description: 'Prerequisite sibling permission codes (for display; parallels dependsOn ids)',
  })
  dependsOnCodes: string[];

  @ApiProperty({ example: 0 })
  sortOrder: number;

  // Maps a permission table row to a FeaturePermissionDto
  static from(row: FeaturePermissionTableRow): FeaturePermissionDto {
    const dto = new FeaturePermissionDto();
    dto.id = row.id;
    dto.featureId = row.featureId;
    dto.featureName = row.featureName;
    dto.code = row.code;
    dto.label = row.label;
    dto.isGlobal = row.isGlobal;
    dto.businessIds = row.businessIds;
    dto.dependsOn = row.dependsOn;
    dto.dependsOnCodes = row.dependsOnCodes;
    dto.sortOrder = row.sortOrder;
    return dto;
  }
}
