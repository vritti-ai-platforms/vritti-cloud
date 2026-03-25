import { Injectable, Logger } from '@nestjs/common';
import { ConflictException, CreateResponseDto, NotFoundException, SuccessResponseDto } from '@vritti/api-sdk';
import { AppPriceDto } from '@/modules/admin-api/app-version/app/app-price/dto/entity/app-price.dto';
import type { CreateAppPriceDto } from '@/modules/admin-api/app-version/app/app-price/dto/request/create-app-price.dto';
import { AppRepository } from '../../root/repositories/app.repository';
import { AppPriceRepository } from '../repositories/app-price.repository';

@Injectable()
export class AppPriceService {
  private readonly logger = new Logger(AppPriceService.name);

  constructor(
    private readonly appPriceRepository: AppPriceRepository,
    private readonly appRepository: AppRepository,
  ) {}

  // Lists all addon prices for an app with region and provider names
  async findByApp(appId: string): Promise<AppPriceDto[]> {
    await this.ensureAppExists(appId);
    const rows = await this.appPriceRepository.findByAppWithNames(appId);
    this.logger.log(`Fetched prices for app: ${appId}`);
    return rows.map((row) => AppPriceDto.from(row, row.regionName, row.providerName));
  }

  // Creates an addon price for an app; validates unique (appId, regionId, cloudProviderId)
  async create(appId: string, dto: CreateAppPriceDto): Promise<CreateResponseDto<AppPriceDto>> {
    await this.ensureAppExists(appId);
    const existing = await this.appPriceRepository.findByUniqueKey(appId, dto.regionId, dto.cloudProviderId);
    if (existing) {
      throw new ConflictException({
        label: 'Price Already Exists',
        detail: 'A price for this region and provider combination already exists.',
      });
    }
    const price = await this.appPriceRepository.create({
      appId,
      regionId: dto.regionId,
      cloudProviderId: dto.cloudProviderId,
      monthlyPrice: String(dto.monthlyPrice),
      currency: dto.currency,
    });
    this.logger.log(`Created price for app ${appId} (region: ${dto.regionId}, provider: ${dto.cloudProviderId})`);
    return { success: true, message: 'App price created successfully.', data: AppPriceDto.from(price, '', '') };
  }

  // Updates an existing addon price
  async update(priceId: string, dto: Partial<CreateAppPriceDto>): Promise<SuccessResponseDto> {
    const existing = await this.appPriceRepository.findById(priceId);
    if (!existing) {
      throw new NotFoundException('App price not found.');
    }
    const updateData: Record<string, unknown> = {};
    if (dto.monthlyPrice !== undefined) updateData.monthlyPrice = String(dto.monthlyPrice);
    if (dto.currency !== undefined) updateData.currency = dto.currency;
    if (dto.regionId !== undefined) updateData.regionId = dto.regionId;
    if (dto.cloudProviderId !== undefined) updateData.cloudProviderId = dto.cloudProviderId;
    await this.appPriceRepository.update(priceId, updateData);
    this.logger.log(`Updated price: ${priceId}`);
    return { success: true, message: 'App price updated successfully.' };
  }

  // Deletes an addon price
  async remove(priceId: string): Promise<SuccessResponseDto> {
    const existing = await this.appPriceRepository.findById(priceId);
    if (!existing) {
      throw new NotFoundException('App price not found.');
    }
    await this.appPriceRepository.delete(priceId);
    this.logger.log(`Deleted price: ${priceId}`);
    return { success: true, message: 'App price deleted successfully.' };
  }

  // Validates that an app exists; throws NotFoundException otherwise
  private async ensureAppExists(appId: string): Promise<void> {
    const app = await this.appRepository.findById(appId);
    if (!app) {
      throw new NotFoundException('App not found.');
    }
  }
}
