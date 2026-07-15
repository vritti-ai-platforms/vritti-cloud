import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession } from '@vritti/api-sdk/auth';
import type { SelectQueryResult } from '@vritti/api-sdk/database';
import { SessionTypeValues } from '@/db/schema';
import { RoleSelectQueryDto } from '../dto/role-select-query.dto';
import { RoleSelectService } from '../services/role-select.service';

@ApiTags('Select')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.CLOUD, SessionTypeValues.ADMIN)
@Controller('roles')
export class RoleSelectController {
  private readonly logger = new Logger(RoleSelectController.name);

  constructor(private readonly roleSelectService: RoleSelectService) {}

  // Returns the org's roles matching an exact scope as select options
  @Get()
  findForSelect(@Query() query: RoleSelectQueryDto): Promise<SelectQueryResult> {
    this.logger.log(`GET /select-api/roles?scope=${query.scope}`);
    return this.roleSelectService.findRolesForSelect(query);
  }
}
