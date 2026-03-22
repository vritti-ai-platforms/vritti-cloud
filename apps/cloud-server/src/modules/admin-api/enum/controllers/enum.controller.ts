import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FeatureTypeValues } from '@/db/schema';
import { ApiGetPermissionTypes } from '../docs/enum.docs';

@ApiTags('Admin - Enums')
@ApiBearerAuth()
@Controller('enums')
export class EnumController {
  // Returns all available permission types
  @Get('permission-types')
  @ApiGetPermissionTypes()
  getPermissionTypes(): { values: string[] } {
    return { values: Object.values(FeatureTypeValues) };
  }
}
