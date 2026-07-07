import type { PlanPriceWithDetails } from '@domain/plan-price/repositories/plan-price.repository';
import { ApiProperty } from '@nestjs/swagger';
import { CurrencyAmountDto } from '@vritti/api-sdk/money';

export class PlanPriceDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  planId: string;

  @ApiProperty({ example: 'Starter' })
  planName: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  countryId: string;

  @ApiProperty({ example: 'India' })
  countryName: string;

  @ApiProperty({ example: 'IN' })
  countryCode: string;

  @ApiProperty({ example: 'INR' })
  currencyCode: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  billingCycleId: string;

  @ApiProperty({ example: 'Monthly' })
  billingCycleName: string;

  @ApiProperty({ example: 30 })
  billingCycleDays: number;

  @ApiProperty({ example: { currency: 'INR', value: '999.00' }, description: 'Amount in major units' })
  amount: CurrencyAmountDto;

  // Maps a plan price joined with plan, country, and billing cycle data to a PlanPriceDto
  static from(row: PlanPriceWithDetails): PlanPriceDto {
    const dto = new PlanPriceDto();
    dto.id = row.id;
    dto.planId = row.planId;
    dto.planName = row.planName;
    dto.countryId = row.countryId;
    dto.countryName = row.countryName;
    dto.countryCode = row.countryCode;
    dto.currencyCode = row.currencyCode;
    dto.billingCycleId = row.billingCycleId;
    dto.billingCycleName = row.billingCycleName;
    dto.billingCycleDays = row.billingCycleDays;
    dto.amount = CurrencyAmountDto.from(row.amount, row.currencyCode);
    return dto;
  }
}
