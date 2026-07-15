import { ApiProperty } from '@nestjs/swagger';
import { CoreRoleDto } from '@/modules/cloud-api/organization/dto/entity/core-role.dto';

class SiteRolesDto {
  @ApiProperty({ type: [CoreRoleDto] })
  OUTLET: CoreRoleDto[];

  @ApiProperty({ type: [CoreRoleDto] })
  WAREHOUSE: CoreRoleDto[];

  @ApiProperty({ type: [CoreRoleDto] })
  PRODUCTION: CoreRoleDto[];
}

export class RolesByScopeDto {
  @ApiProperty({ type: [CoreRoleDto] })
  ORG: CoreRoleDto[];

  @ApiProperty({ type: [CoreRoleDto] })
  LE: CoreRoleDto[];

  @ApiProperty({ type: [CoreRoleDto] })
  SITE_GROUP: CoreRoleDto[];

  @ApiProperty({ type: SiteRolesDto })
  SITE: SiteRolesDto;
}
