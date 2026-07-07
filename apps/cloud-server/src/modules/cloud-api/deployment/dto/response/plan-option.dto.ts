import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CurrencyAmountDto } from '@vritti/api-sdk/money';

export class PlanOptionDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'Pro' })
  name: string;

  @ApiProperty({ example: 'pro' })
  code: string;

  @ApiProperty({
    type: CurrencyAmountDto,
    description: 'Monthly price in the country currency (major units); zero when unpriced',
    example: { currency: 'INR', value: '2999.00' },
  })
  price: CurrencyAmountDto;

  @ApiPropertyOptional({ description: 'Rich content stored as Lexical JSON', nullable: true })
  content: string | null;
}
