import { ApiProperty } from '@nestjs/swagger';
import { CurrencyAmountDto, IsCurrency } from '@vritti/api-sdk/money';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsUUID, ValidateNested } from 'class-validator';

export class PlanPriceEntryDto {
  @ApiProperty({ description: 'Billing cycle UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  billingCycleId: string;

  @ApiProperty({ description: 'Amount in major units', example: { currency: 'INR', value: '999.00' } })
  @IsCurrency()
  amount: CurrencyAmountDto;
}

export class CreatePlanPricesDto {
  @ApiProperty({ description: 'Country UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  countryId: string;

  @ApiProperty({ type: [PlanPriceEntryDto], description: 'Amounts per billing cycle' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PlanPriceEntryDto)
  entries: PlanPriceEntryDto[];
}
