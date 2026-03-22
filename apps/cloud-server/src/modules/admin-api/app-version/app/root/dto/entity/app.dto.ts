import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { App } from '@/db/schema';

export class AppDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  appVersionId: string;

  @ApiProperty({ example: 'pos' })
  code: string;

  @ApiProperty({ example: 'Point of Sale' })
  name: string;

  @ApiPropertyOptional({ example: 'Core POS module for order management', nullable: true })
  description: string | null;

  @ApiPropertyOptional({ example: 'shopping-cart', nullable: true })
  icon: string | null;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: 0 })
  sortOrder: number;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiPropertyOptional({ type: 'string', format: 'date-time', nullable: true })
  updatedAt: Date | null;

  @ApiProperty({ example: 5 })
  featureCount: number;

  @ApiProperty({ example: 2 })
  planCount: number;

  @ApiProperty({ example: true, description: 'False when the app is referenced by plans or industries' })
  canDelete: boolean;

  // Maps an App entity to an AppDto with counts
  static from(app: App, featureCount = 0, planCount = 0): AppDto {
    const dto = new AppDto();
    dto.id = app.id;
    dto.appVersionId = app.appVersionId;
    dto.code = app.code;
    dto.name = app.name;
    dto.description = app.description;
    dto.icon = app.icon;
    dto.isActive = app.isActive;
    dto.sortOrder = app.sortOrder;
    dto.createdAt = app.createdAt;
    dto.updatedAt = app.updatedAt;
    dto.featureCount = featureCount;
    dto.planCount = planCount;
    dto.canDelete = planCount === 0;
    return dto;
  }
}
