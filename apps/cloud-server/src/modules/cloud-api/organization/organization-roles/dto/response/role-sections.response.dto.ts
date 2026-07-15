import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { ScopeType, SiteType } from '@vritti/api-sdk/catalog-resolver';
import { CoreRoleDto } from '@/modules/cloud-api/organization/dto/entity/core-role.dto';
import { RoleTemplateResponseDto } from './role-template.response.dto';

class RoleTemplateRowDto {
  @ApiProperty({ type: RoleTemplateResponseDto })
  template: RoleTemplateResponseDto;

  @ApiPropertyOptional({ type: CoreRoleDto, nullable: true, description: 'The enabled default-role instance, if created' })
  role: CoreRoleDto | null;
}

class RoleSiteTypeGroupDto {
  @ApiProperty({ enum: ['OUTLET', 'WAREHOUSE', 'PRODUCTION'] })
  siteType: SiteType;

  @ApiProperty({ type: [RoleTemplateRowDto] })
  templates: RoleTemplateRowDto[];

  @ApiProperty({ type: [CoreRoleDto] })
  customRoles: CoreRoleDto[];
}

export class RoleScopeSectionDto {
  @ApiProperty({ enum: ['ORG', 'LE', 'SITE_GROUP', 'SITE'] })
  scope: ScopeType;

  @ApiProperty({ type: [RoleTemplateRowDto] })
  templates: RoleTemplateRowDto[];

  @ApiProperty({ type: [CoreRoleDto] })
  customRoles: CoreRoleDto[];

  @ApiProperty({ type: [RoleSiteTypeGroupDto], description: 'Populated only for the SITE scope' })
  siteTypeGroups: RoleSiteTypeGroupDto[];
}
