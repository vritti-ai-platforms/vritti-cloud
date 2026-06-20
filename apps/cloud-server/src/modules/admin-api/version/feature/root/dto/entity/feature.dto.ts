import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Feature } from '@/db/schema';

export class FeatureDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  versionId: string;

  @ApiProperty({ example: 'orders.dine-in.create' })
  code: string;

  @ApiProperty({ example: 'Create Dine-In Order' })
  name: string;

  @ApiPropertyOptional({ example: 'Allows creating a new dine-in order', nullable: true })
  description: string | null;

  @ApiProperty({ example: 'clipboard-list' })
  icon: string;

  @ApiProperty({ example: 'cart.fill', description: 'iOS SF Symbol name' })
  sfSymbol: string;

  @ApiProperty({ example: 'shopping_cart', description: 'Android Material Symbol name' })
  materialSymbol: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: 0 })
  sortOrder: number;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiPropertyOptional({ type: 'string', format: 'date-time', nullable: true })
  updatedAt: Date | null;

  @ApiProperty({ example: ['VIEW', 'CREATE', 'EDIT'], type: [String] })
  permissions: string[];

  @ApiProperty({ example: ['WEB', 'MOBILE'], type: [String] })
  platforms: string[];

  @ApiProperty({ example: 2, description: 'Number of businesses whose apps include this feature' })
  businessCount: number;

  @ApiProperty({ example: true, description: 'False when the feature is referenced by app_features' })
  canDelete: boolean;

  // Maps a Feature entity to a FeatureDto. businessCount drives the display; appRefCount (app_features count) drives canDelete.
  static from(
    feature: Feature,
    businessCount = 0,
    permissions: string[] = [],
    platforms: string[] = [],
    appRefCount = 0,
  ): FeatureDto {
    const dto = new FeatureDto();
    dto.id = feature.id;
    dto.versionId = feature.versionId;
    dto.code = feature.code;
    dto.name = feature.name;
    dto.description = feature.description;
    dto.icon = feature.icon;
    dto.sfSymbol = feature.sfSymbol;
    dto.materialSymbol = feature.materialSymbol;
    dto.isActive = feature.isActive;
    dto.sortOrder = feature.sortOrder;
    dto.createdAt = feature.createdAt;
    dto.updatedAt = feature.updatedAt;
    dto.permissions = permissions;
    dto.platforms = platforms;
    dto.businessCount = businessCount;
    dto.canDelete = appRefCount === 0;
    return dto;
  }
}
