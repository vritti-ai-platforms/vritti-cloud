import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsUUID, ValidateNested } from 'class-validator';
import { type FeatureType, FeatureTypeValues } from '@/db/schema';

class FeaturePermissionEntry {
  @ApiProperty({ description: 'Feature UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  featureId: string;

  @ApiProperty({ enum: FeatureTypeValues, description: 'Permission type (VIEW, CREATE, EDIT, DELETE, etc.)' })
  @IsEnum(FeatureTypeValues)
  type: FeatureType;
}

export class AssignRoleTemplatePermissionsDto {
  @ApiProperty({ description: 'Feature permissions to assign to the role template', type: [FeaturePermissionEntry] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeaturePermissionEntry)
  permissions: FeaturePermissionEntry[];
}
