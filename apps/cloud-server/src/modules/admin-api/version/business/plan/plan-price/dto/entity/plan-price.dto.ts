import type { PlanPriceWithCountry } from '@domain/plan-price/repositories/plan-price.repository';
import { ApiProperty } from '@nestjs/swagger';
import type { BillingPeriod } from '@/db/schema';

export class PlanPriceDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  planId: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  countryId: string;

  @ApiProperty({ example: 'India' })
  countryName: string;

  @ApiProperty({ example: 'IN' })
  countryCode: string;

  @ApiProperty({ example: 'INR' })
  currencyCode: string;

  @ApiProperty({ example: 'monthly', enum: ['monthly', 'annual', 'triennial'] })
  billingPeriod: BillingPeriod;

  @ApiProperty({ example: 99900, description: "Amount in the country's default-currency minor units" })
  amount: number;

  // Maps a plan price joined with country data to a PlanPriceDto
  static from(row: PlanPriceWithCountry): PlanPriceDto {
    const dto = new PlanPriceDto();
    dto.id = row.id;
    dto.planId = row.planId;
    dto.countryId = row.countryId;
    dto.countryName = row.countryName;
    dto.countryCode = row.countryCode;
    dto.currencyCode = row.currencyCode;
    dto.billingPeriod = row.billingPeriod;
    dto.amount = row.amount;
    return dto;
  }
}
