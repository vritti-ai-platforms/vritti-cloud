import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayUnique, IsArray, IsEnum, IsUUID, ValidateNested } from 'class-validator';
import { type AppPlatform, AppPlatformValues } from '@/db/schema';

export class RoleTemplateGrantDto {
  @ApiProperty({
    description: 'Feature granted by this role on this platform (the View/route gate)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  featureId: string;

  @ApiProperty({ description: 'Platform this grant applies to', enum: ['WEB', 'MOBILE'], example: 'WEB' })
  @IsEnum(AppPlatformValues)
  platform: AppPlatform;

  @ApiProperty({
    description: 'Feature-permission ids granted under this grant (empty = view-only)',
    type: [String],
    example: ['550e8400-e29b-41d4-a716-446655440000'],
  })
  @IsArray()
  @IsUUID('all', { each: true })
  permissions: string[];
}

export class AssignRoleTemplatePermissionsDto {
  @ApiProperty({
    description: 'Per-platform feature grants, each with its granted permissions (full replace)',
    type: [RoleTemplateGrantDto],
  })
  @IsArray()
  @ArrayUnique((g: RoleTemplateGrantDto) => `${g.featureId}:${g.platform}`)
  @ValidateNested({ each: true })
  @Type(() => RoleTemplateGrantDto)
  grants: RoleTemplateGrantDto[];
}
