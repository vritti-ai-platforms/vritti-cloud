import { ApiProperty } from '@nestjs/swagger';
import type { FeaturePermission } from '@/db/schema';

export class FeaturePermissionDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  featureId: string;

  @ApiProperty({ example: 'VIEW' })
  type: string;

  // Maps a FeaturePermission entity to a FeaturePermissionDto
  static from(entity: FeaturePermission): FeaturePermissionDto {
    const dto = new FeaturePermissionDto();
    dto.id = entity.id;
    dto.featureId = entity.featureId;
    dto.type = entity.type;
    return dto;
  }
}
