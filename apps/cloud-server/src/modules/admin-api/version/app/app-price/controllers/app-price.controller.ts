import { AppPriceService } from '@domain/version/app/app-price/services/app-price.service';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateResponseDto, RequireSession, SuccessResponseDto } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import { ApiCreateAppPrice, ApiDeleteAppPrice, ApiListAppPrices, ApiUpdateAppPrice } from '../docs/app-price.docs';
import { AppPriceDto } from '../dto/entity/app-price.dto';
import { CreateAppPriceDto } from '../dto/request/create-app-price.dto';

@ApiTags('Admin - App Prices')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.ADMIN)
@Controller('versions/:versionId/apps/:appId/prices')
export class AppPriceController {
  private readonly logger = new Logger(AppPriceController.name);

  constructor(private readonly appPriceService: AppPriceService) {}

  // Lists addon prices for an app
  @Get()
  @ApiListAppPrices()
  findByApp(@Param('appId') appId: string): Promise<AppPriceDto[]> {
    this.logger.log(`GET /admin-api/apps/${appId}/prices`);
    return this.appPriceService.findByApp(appId);
  }

  // Creates an addon price for a region + provider
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateAppPrice()
  create(@Param('appId') appId: string, @Body() dto: CreateAppPriceDto): Promise<CreateResponseDto<AppPriceDto>> {
    this.logger.log(`POST /admin-api/apps/${appId}/prices`);
    return this.appPriceService.create(appId, dto);
  }

  // Updates an addon price
  @Patch(':priceId')
  @ApiUpdateAppPrice()
  update(
    @Param('appId') appId: string,
    @Param('priceId') priceId: string,
    @Body() dto: CreateAppPriceDto,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`PATCH /admin-api/apps/${appId}/prices/${priceId}`);
    return this.appPriceService.update(priceId, dto);
  }

  // Deletes an addon price
  @Delete(':priceId')
  @HttpCode(HttpStatus.OK)
  @ApiDeleteAppPrice()
  delete(@Param('appId') appId: string, @Param('priceId') priceId: string): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /admin-api/apps/${appId}/prices/${priceId}`);
    return this.appPriceService.remove(priceId);
  }
}
