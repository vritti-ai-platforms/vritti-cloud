import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsUUID } from 'class-validator';

export class AssignRoleTemplatePermissionsDto {
  @ApiProperty({
    description: 'Feature permission IDs to grant to the role template (full replace)',
    type: [String],
    example: ['550e8400-e29b-41d4-a716-446655440000'],
  })
  @IsArray()
  @ArrayUnique()
  @IsUUID('all', { each: true })
  featurePermissionIds: string[];
}
