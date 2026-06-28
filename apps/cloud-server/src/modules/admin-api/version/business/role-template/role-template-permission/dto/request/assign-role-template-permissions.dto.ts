import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayUnique, IsArray, IsEnum, IsUUID, ValidateNested } from 'class-validator';
import { type AppPlatform, AppPlatformValues } from '@/db/schema';

export class RoleTemplateMembershipDto {
  @ApiProperty({
    description: 'Feature included in this role on this platform (the View/route gate)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  featureId: string;

  @ApiProperty({ description: 'Platform this membership applies to', enum: ['WEB', 'MOBILE'], example: 'WEB' })
  @IsEnum(AppPlatformValues)
  platform: AppPlatform;

  @ApiProperty({
    description: 'Feature-permission ids granted under this membership (empty = view-only member)',
    type: [String],
    example: ['550e8400-e29b-41d4-a716-446655440000'],
  })
  @IsArray()
  @IsUUID('all', { each: true })
  permissions: string[];
}

export class AssignRoleTemplatePermissionsDto {
  @ApiProperty({
    description: 'Per-platform feature memberships, each with its granted permissions (full replace)',
    type: [RoleTemplateMembershipDto],
  })
  @IsArray()
  @ArrayUnique((m: RoleTemplateMembershipDto) => `${m.featureId}:${m.platform}`)
  @ValidateNested({ each: true })
  @Type(() => RoleTemplateMembershipDto)
  memberships: RoleTemplateMembershipDto[];
}
