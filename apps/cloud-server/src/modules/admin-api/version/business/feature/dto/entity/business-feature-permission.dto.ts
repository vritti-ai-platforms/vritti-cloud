import type { BusinessFeaturePermission } from '@domain/version/feature/feature-permission/repositories/feature-permission.repository';
import { ApiProperty } from '@nestjs/swagger';

export class BusinessFeaturePermissionDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'add_salt' })
  code: string;

  @ApiProperty({ example: 'Add Salt' })
  label: string;

  @ApiProperty({ example: true })
  isGlobal: boolean;

  // Maps a permission row to a BusinessFeaturePermissionDto
  static from(permission: BusinessFeaturePermission): BusinessFeaturePermissionDto {
    const dto = new BusinessFeaturePermissionDto();
    dto.id = permission.id;
    dto.code = permission.code;
    dto.label = permission.label;
    dto.isGlobal = permission.isGlobal;
    return dto;
  }
}
