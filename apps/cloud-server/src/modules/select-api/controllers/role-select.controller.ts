import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession, type SelectQueryResult } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import { RoleService } from '@domain/version/role/root/services/role.service';
import { RoleSelectQueryDto } from '../dto/role-select-query.dto';

@ApiTags('Select')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.CLOUD, SessionTypeValues.ADMIN)
@Controller('roles')
export class RoleSelectController {
  private readonly logger = new Logger(RoleSelectController.name);

  constructor(private readonly roleService: RoleService) {}

  // Returns paginated role options for the select component
  @Get()
  findForSelect(@Query() query: RoleSelectQueryDto): Promise<SelectQueryResult> {
    this.logger.log('GET /select-api/roles');
    return this.roleService.findForSelect(query);
  }
}
