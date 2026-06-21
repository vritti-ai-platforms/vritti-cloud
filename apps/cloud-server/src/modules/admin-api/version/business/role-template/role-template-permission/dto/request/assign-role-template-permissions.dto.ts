import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayUnique, IsArray, IsEnum, IsUUID, ValidateNested } from 'class-validator';
import { type AppPlatform, AppPlatformValues } from '@/db/schema';

export class RoleTemplateGrantDto {
  @ApiProperty({ description: 'Feature permission ID to grant', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  featurePermissionId: string;

  @ApiProperty({ description: 'Platform this grant applies to', enum: ['WEB', 'MOBILE'], example: 'WEB' })
  @IsEnum(AppPlatformValues)
  platform: AppPlatform;
}

export class AssignRoleTemplatePermissionsDto {
  @ApiProperty({
    description: 'Platform-scoped permission grants for the role template (full replace)',
    type: [RoleTemplateGrantDto],
  })
  @IsArray()
  @ArrayUnique((g: RoleTemplateGrantDto) => `${g.featurePermissionId}:${g.platform}`)
  @ValidateNested({ each: true })
  @Type(() => RoleTemplateGrantDto)
  grants: RoleTemplateGrantDto[];
}
