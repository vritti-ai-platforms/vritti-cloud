import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PlanOptionDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'Pro' })
  name: string;

  @ApiProperty({ example: 'pro' })
  code: string;

  @ApiPropertyOptional({ example: 299900, nullable: true, description: "Amount in the country's currency minor units" })
  amount: number | null;

  @ApiPropertyOptional({ example: 'INR', nullable: true })
  currency: string | null;

  @ApiPropertyOptional({ description: 'Rich content stored as Lexical JSON', nullable: true })
  content: string | null;
}
