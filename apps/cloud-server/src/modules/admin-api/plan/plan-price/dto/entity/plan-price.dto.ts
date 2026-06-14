import type { PlanPriceWithMarket } from '@domain/plan-price/repositories/plan-price.repository';
import { ApiProperty } from '@nestjs/swagger';
import type { BillingPeriod } from '@/db/schema';

export class PlanPriceDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  planId: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  marketId: string;

  @ApiProperty({ example: 'India' })
  marketName: string;

  @ApiProperty({ example: 'IN' })
  marketCode: string;

  @ApiProperty({ example: 'INR' })
  currencyCode: string;

  @ApiProperty({ example: 'monthly', enum: ['monthly', 'annual', 'triennial'] })
  billingPeriod: BillingPeriod;

  @ApiProperty({ example: 99900, description: 'Amount in the market currency minor units' })
  amount: number;

  // Maps a plan price joined with market data to a PlanPriceDto
  static from(row: PlanPriceWithMarket): PlanPriceDto {
    const dto = new PlanPriceDto();
    dto.id = row.id;
    dto.planId = row.planId;
    dto.marketId = row.marketId;
    dto.marketName = row.marketName;
    dto.marketCode = row.marketCode;
    dto.currencyCode = row.currencyCode;
    dto.billingPeriod = row.billingPeriod;
    dto.amount = row.amount;
    return dto;
  }
}
