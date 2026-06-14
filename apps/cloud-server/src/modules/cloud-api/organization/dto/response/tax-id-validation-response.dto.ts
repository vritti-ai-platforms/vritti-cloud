import { ApiProperty } from '@nestjs/swagger';

export class TaxIdValidationResponseDto {
  @ApiProperty({ example: true })
  valid: boolean;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  countryId: string;

  @ApiProperty({ example: 'IN' })
  countryCode: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  marketId: string;
}
