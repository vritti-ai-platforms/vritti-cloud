import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession } from '@vritti/api-sdk';
import { FeatureTypeValues, SessionTypeValues } from '@/db/schema';
import { ApiGetPermissionTypes } from '../docs/enum.docs';

@ApiTags('Admin - Enums')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.ADMIN)
@Controller('enums')
export class EnumController {
  // Returns all available permission types
  @Get('permission-types')
  @ApiGetPermissionTypes()
  getPermissionTypes(): { values: string[] } {
    return { values: Object.values(FeatureTypeValues) };
  }
}
