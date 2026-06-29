import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { App } from '@/db/schema';

export class AppDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  versionId: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  businessId: string;

  @ApiProperty({ example: 'pos' })
  code: string;

  @ApiProperty({ example: 'Point of Sale' })
  name: string;

  @ApiPropertyOptional({ example: 'Core POS module for order management', nullable: true })
  description: string | null;

  @ApiProperty({ example: 'shopping-cart' })
  icon: string;

  @ApiProperty({ example: 0 })
  sortOrder: number;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiPropertyOptional({ type: 'string', format: 'date-time', nullable: true })
  updatedAt: Date | null;

  @ApiProperty({ example: 5 })
  featureCount: number;

  @ApiProperty({ example: true, description: 'Whether the app can be deleted' })
  canDelete: boolean;

  // Maps an App entity to an AppDto with counts
  static from(app: App, featureCount = 0): AppDto {
    const dto = new AppDto();
    dto.id = app.id;
    dto.versionId = app.versionId;
    dto.businessId = app.businessId;
    dto.code = app.code;
    dto.name = app.name;
    dto.description = app.description;
    dto.icon = app.icon;
    dto.sortOrder = app.sortOrder;
    dto.createdAt = app.createdAt;
    dto.updatedAt = app.updatedAt;
    dto.featureCount = featureCount;
    // An app is a grouping layer — it can only be deleted once no features are pinned to it
    dto.canDelete = featureCount === 0;
    return dto;
  }
}
