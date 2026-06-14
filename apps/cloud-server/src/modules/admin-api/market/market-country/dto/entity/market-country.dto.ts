import { ApiProperty } from '@nestjs/swagger';

export class MarketCountryDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  marketId: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  countryId: string;

  @ApiProperty({ example: 'IN' })
  countryCode: string;

  @ApiProperty({ example: 'India' })
  countryName: string;

  // Creates a MarketCountryDto from a joined market-country row
  static from(row: {
    id: string;
    marketId: string;
    countryId: string;
    countryCode: string;
    countryName: string;
  }): MarketCountryDto {
    const dto = new MarketCountryDto();
    dto.id = row.id;
    dto.marketId = row.marketId;
    dto.countryId = row.countryId;
    dto.countryCode = row.countryCode;
    dto.countryName = row.countryName;
    return dto;
  }
}
