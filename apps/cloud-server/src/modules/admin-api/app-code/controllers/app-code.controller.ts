import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SelectOptionsQueryDto, type SelectQueryResult } from '@vritti/api-sdk';
import { AppCodeService } from '../services/app-code.service';

@ApiTags('Admin - App Codes')
@ApiBearerAuth()
@Controller('apps/codes')
export class AppCodeController {
  constructor(private readonly appCodeService: AppCodeService) {}

  // Returns distinct app codes across all versions for the select component
  @Get('select')
  findForSelect(@Query() query: SelectOptionsQueryDto): Promise<SelectQueryResult> {
    return this.appCodeService.findForSelect(query);
  }

  // Returns distinct feature codes for a given app code
  @Get(':appCode/features/select')
  findFeatureCodesForSelect(@Param('appCode') appCode: string, @Query() query: SelectOptionsQueryDto) {
    return this.appCodeService.findFeatureCodesForSelect(appCode, query);
  }
}
