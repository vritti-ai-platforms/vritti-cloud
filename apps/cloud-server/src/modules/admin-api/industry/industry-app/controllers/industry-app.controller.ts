import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SuccessResponseDto } from '@vritti/api-sdk';
import { ApiAssignIndustryApp, ApiGetIndustryApps, ApiRemoveIndustryApp, ApiUpdateIndustryApp } from '../docs/industry-app.docs';
import { IndustryAppDto } from '../dto/entity/industry-app.dto';
import { AssignIndustryAppDto } from '../dto/request/assign-industry-app.dto';
import { UpdateIndustryAppDto } from '../dto/request/update-industry-app.dto';
import { IndustryAppService } from '../services/industry-app.service';

@ApiTags('Admin - Industry Apps')
@ApiBearerAuth()
@Controller('industries/:industryId/apps')
export class IndustryAppController {
  private readonly logger = new Logger(IndustryAppController.name);

  constructor(private readonly industryAppService: IndustryAppService) {}

  // Lists apps assigned to an industry
  @Get()
  @ApiGetIndustryApps()
  findByIndustry(@Param('industryId') industryId: string): Promise<IndustryAppDto[]> {
    this.logger.log(`GET /admin-api/industries/${industryId}/apps`);
    return this.industryAppService.findByIndustry(industryId);
  }

  // Assigns an app to an industry
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiAssignIndustryApp()
  assign(@Param('industryId') industryId: string, @Body() dto: AssignIndustryAppDto): Promise<IndustryAppDto> {
    this.logger.log(`POST /admin-api/industries/${industryId}/apps`);
    return this.industryAppService.assign(industryId, dto);
  }

  // Updates an industry-app assignment
  @Patch(':appId')
  @ApiUpdateIndustryApp()
  update(
    @Param('industryId') industryId: string,
    @Param('appId') appId: string,
    @Body() dto: UpdateIndustryAppDto,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`PATCH /admin-api/industries/${industryId}/apps/${appId}`);
    return this.industryAppService.update(industryId, appId, dto);
  }

  // Removes an app from an industry
  @Delete(':appId')
  @HttpCode(HttpStatus.OK)
  @ApiRemoveIndustryApp()
  remove(@Param('industryId') industryId: string, @Param('appId') appId: string): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /admin-api/industries/${industryId}/apps/${appId}`);
    return this.industryAppService.remove(industryId, appId);
  }
}
