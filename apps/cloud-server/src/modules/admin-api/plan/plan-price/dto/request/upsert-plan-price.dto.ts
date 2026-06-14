import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsUUID, Min } from 'class-validator';
import { type BillingPeriod, BillingPeriodValues } from '@/db/schema';

export class UpsertPlanPriceDto {
  @ApiProperty({ description: 'Market UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  marketId: string;

  @ApiProperty({ description: 'Billing period', enum: ['monthly', 'annual', 'triennial'], example: 'monthly' })
  @IsEnum(BillingPeriodValues)
  billingPeriod: BillingPeriod;

  @ApiProperty({ description: 'Amount in the market currency minor units', example: 99900 })
  @IsInt()
  @Min(0)
  amount: number;
}
