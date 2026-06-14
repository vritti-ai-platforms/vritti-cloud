import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AssignMarketCountryDto {
  @ApiProperty({
    description: 'Country UUID to assign to this market',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  countryId: string;
}
