import { Injectable, Logger } from '@nestjs/common';
import { CreateResponseDto, NotFoundException, SuccessResponseDto } from '@vritti/api-sdk';
import { PlanPriceDto } from '@/modules/admin-api/version/business/plan/plan-price/dto/entity/plan-price.dto';
import type { UpsertPlanPriceDto } from '@/modules/admin-api/version/business/plan/plan-price/dto/request/upsert-plan-price.dto';
import { PlanPriceRepository } from '../repositories/plan-price.repository';

@Injectable()
export class PlanPriceService {
  private readonly logger = new Logger(PlanPriceService.name);

  constructor(private readonly planPriceRepository: PlanPriceRepository) {}

  // Lists all prices for a plan with country name and currency
  async findByPlan(planId: string): Promise<PlanPriceDto[]> {
    await this.ensurePlanExists(planId);
    const rows = await this.planPriceRepository.findByPlanWithCountry(planId);
    this.logger.log(`Fetched ${rows.length} prices for plan: ${planId}`);
    return rows.map(PlanPriceDto.from);
  }

  // Upserts a plan price for a country + billing period; creates or updates the amount
  async upsert(planId: string, dto: UpsertPlanPriceDto): Promise<CreateResponseDto<PlanPriceDto>> {
    await this.ensurePlanExists(planId);
    const existing = await this.planPriceRepository.findByComposite(planId, dto.countryId, dto.billingPeriod);
    if (existing) {
      await this.planPriceRepository.updateAmount(existing.id, dto.amount);
      this.logger.log(`Updated plan price ${existing.id} for plan ${planId} (${dto.billingPeriod})`);
    } else {
      await this.planPriceRepository.create({
        planId,
        countryId: dto.countryId,
        billingPeriod: dto.billingPeriod,
        amount: dto.amount,
      });
      this.logger.log(`Created plan price for plan ${planId} (country: ${dto.countryId}, ${dto.billingPeriod})`);
    }
    const rows = await this.planPriceRepository.findByPlanWithCountry(planId);
    const row = rows.find((r) => r.countryId === dto.countryId && r.billingPeriod === dto.billingPeriod);
    if (!row) {
      throw new NotFoundException('Plan price not found after save.');
    }
    return { success: true, message: 'Plan price saved successfully.', data: PlanPriceDto.from(row) };
  }

  // Deletes a plan price by country + billing period
  async remove(planId: string, dto: UpsertPlanPriceDto): Promise<SuccessResponseDto> {
    await this.ensurePlanExists(planId);
    const existing = await this.planPriceRepository.findByComposite(planId, dto.countryId, dto.billingPeriod);
    if (!existing) {
      throw new NotFoundException('Plan price not found.');
    }
    await this.planPriceRepository.removeByComposite(planId, dto.countryId, dto.billingPeriod);
    this.logger.log(`Deleted plan price for plan ${planId} (country: ${dto.countryId}, ${dto.billingPeriod})`);
    return { success: true, message: 'Plan price deleted successfully.' };
  }

  // Returns the number of prices configured for a plan
  countForPlan(planId: string): Promise<number> {
    return this.planPriceRepository.countByPlanId(planId);
  }

  // Validates that a plan exists; throws NotFoundException otherwise
  private async ensurePlanExists(planId: string): Promise<void> {
    const exists = await this.planPriceRepository.planExists(planId);
    if (!exists) {
      throw new NotFoundException('Plan not found.');
    }
  }
}
