import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession, type SelectQueryResult } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import { RoleTemplateService } from '@domain/version/role-template/root/services/role-template.service';
import { RoleTemplateSelectQueryDto } from '../dto/role-template-select-query.dto';

@ApiTags('Select')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.CLOUD, SessionTypeValues.ADMIN)
@Controller('role-templates')
export class RoleTemplateSelectController {
  private readonly logger = new Logger(RoleTemplateSelectController.name);

  constructor(private readonly roleTemplateService: RoleTemplateService) {}

  // Returns paginated role template options for the select component
  @Get()
  findForSelect(@Query() query: RoleTemplateSelectQueryDto): Promise<SelectQueryResult> {
    this.logger.log('GET /select-api/role-templates');
    return this.roleTemplateService.findForSelect(query);
  }
}
