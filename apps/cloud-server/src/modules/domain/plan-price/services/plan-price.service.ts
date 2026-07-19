import { Injectable, Logger } from '@nestjs/common';
import { SuccessResponseDto } from '@vritti/api-sdk/database';
import { NotFoundException } from '@vritti/api-sdk/exceptions';
import { type CurrencyAmountDto, type CurrencyCode, majorToMinor } from '@vritti/api-sdk/money';
import { PlanPriceDto } from '@/modules/admin-api/version/business/plan/plan-price/dto/entity/plan-price.dto';
import type { CreatePlanPricesDto } from '@/modules/admin-api/version/business/plan/plan-price/dto/request/create-plan-prices.dto';
import { PlanPriceDomainRepository } from '../repositories/plan-price.repository';

@Injectable()
export class PlanPriceDomainService {
  private readonly logger = new Logger(PlanPriceDomainService.name);

  constructor(private readonly planPriceRepository: PlanPriceDomainRepository) {}

  // Lists all prices for a plan with country and billing cycle details
  async findByPlan(planId: string): Promise<PlanPriceDto[]> {
    const rows = await this.planPriceRepository.findByPlanWithDetails(planId);
    this.logger.log(`Fetched ${rows.length} prices for plan ${planId}`);
    return rows.map(PlanPriceDto.from);
  }

  // Upserts a batch of prices for a plan + country across billing cycles
  async createBatch(planId: string, dto: CreatePlanPricesDto): Promise<SuccessResponseDto> {
    const exists = await this.planPriceRepository.planExists(planId);
    if (!exists) {
      throw new NotFoundException('Plan not found.');
    }
    for (const entry of dto.entries) {
      const minor = majorToMinor(entry.amount.value, entry.amount.currency as CurrencyCode, 'amount');
      const existing = await this.planPriceRepository.findByComposite(planId, dto.countryId, entry.billingCycleId);
      if (existing) {
        await this.planPriceRepository.updateAmount(existing.id, minor);
      } else {
        await this.planPriceRepository.create({
          planId,
          countryId: dto.countryId,
          billingCycleId: entry.billingCycleId,
          amount: minor,
        });
      }
    }
    this.logger.log(`Saved ${dto.entries.length} price(s) for plan ${planId} (country: ${dto.countryId})`);
    return { success: true, message: 'Plan prices saved successfully.' };
  }

  // Updates the amount on a single plan price; throws NotFoundException if missing
  async updateAmount(priceId: string, amount: CurrencyAmountDto): Promise<SuccessResponseDto> {
    const existing = await this.planPriceRepository.findById(priceId);
    if (!existing) {
      throw new NotFoundException('Plan price not found.');
    }
    const minor = majorToMinor(amount.value, amount.currency as CurrencyCode, 'amount');
    await this.planPriceRepository.updateAmount(priceId, minor);
    this.logger.log(`Updated plan price ${priceId} amount`);
    return { success: true, message: 'Plan price updated successfully.' };
  }

  // Deletes a single plan price; throws NotFoundException if missing
  async remove(priceId: string): Promise<SuccessResponseDto> {
    const existing = await this.planPriceRepository.findById(priceId);
    if (!existing) {
      throw new NotFoundException('Plan price not found.');
    }
    await this.planPriceRepository.removeById(priceId);
    this.logger.log(`Deleted plan price ${priceId}`);
    return { success: true, message: 'Plan price deleted successfully.' };
  }

  // Returns the number of prices configured for a plan
  countForPlan(planId: string): Promise<number> {
    return this.planPriceRepository.countByPlanId(planId);
  }
}
