import { ApiProperty } from '@nestjs/swagger';
import { CurrencyAmountDto, IsCurrency } from '@vritti/api-sdk/money';

export class UpdatePlanPriceAmountDto {
  @ApiProperty({ description: 'Amount in major units', example: { currency: 'INR', value: '999.00' } })
  @IsCurrency()
  amount: CurrencyAmountDto;
}
