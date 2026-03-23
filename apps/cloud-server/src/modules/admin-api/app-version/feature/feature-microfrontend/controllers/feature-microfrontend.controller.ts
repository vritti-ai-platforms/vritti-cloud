import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession, SuccessResponseDto } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import {
  ApiListFeatureMicrofrontends,
  ApiRemoveFeatureMicrofrontend,
  ApiSetFeatureMicrofrontend,
} from '../docs/feature-microfrontend.docs';
import { FeatureMicrofrontendDto } from '../dto/entity/feature-microfrontend.dto';
import { SetFeatureMicrofrontendDto } from '../dto/request/set-feature-microfrontend.dto';
import { FeatureMicrofrontendService } from '../services/feature-microfrontend.service';

@ApiTags('Admin - Feature Microfrontends')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.ADMIN)
@Controller('app-versions/:versionId/features/:featureId/microfrontends')
export class FeatureMicrofrontendController {
  private readonly logger = new Logger(FeatureMicrofrontendController.name);

  constructor(private readonly featureMicrofrontendService: FeatureMicrofrontendService) {}

  // Lists all microfrontend links for a feature
  @Get()
  @ApiListFeatureMicrofrontends()
  list(@Param('featureId') featureId: string): Promise<FeatureMicrofrontendDto[]> {
    this.logger.log(`GET /features/${featureId}/microfrontends`);
    return this.featureMicrofrontendService.findByFeature(featureId);
  }

  // Sets or updates a microfrontend link for a feature
  @Put(':microfrontendId')
  @HttpCode(HttpStatus.OK)
  @ApiSetFeatureMicrofrontend()
  set(
    @Param('featureId') featureId: string,
    @Param('microfrontendId') microfrontendId: string,
    @Body() dto: SetFeatureMicrofrontendDto,
  ): Promise<FeatureMicrofrontendDto> {
    this.logger.log(`PUT /features/${featureId}/microfrontends/${microfrontendId}`);
    return this.featureMicrofrontendService.set(featureId, microfrontendId, dto);
  }

  // Removes a microfrontend link from a feature
  @Delete(':microfrontendId')
  @HttpCode(HttpStatus.OK)
  @ApiRemoveFeatureMicrofrontend()
  remove(
    @Param('featureId') featureId: string,
    @Param('microfrontendId') microfrontendId: string,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /features/${featureId}/microfrontends/${microfrontendId}`);
    return this.featureMicrofrontendService.remove(featureId, microfrontendId);
  }
}
