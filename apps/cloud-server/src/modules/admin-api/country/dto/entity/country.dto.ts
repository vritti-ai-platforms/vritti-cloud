import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Country, TaxRegime } from '@/db/schema';

export class CountryDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'IN' })
  code: string;

  @ApiProperty({ example: 'India' })
  name: string;

  @ApiProperty({ example: 'INR' })
  defaultCurrency: string;

  @ApiProperty({ example: 'GST', enum: ['GST', 'VAT', 'NONE'] })
  taxRegime: TaxRegime;

  @ApiPropertyOptional({ example: 'GSTIN', nullable: true })
  taxIdLabel: string | null;

  @ApiPropertyOptional({ example: '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$', nullable: true })
  taxIdPattern: string | null;

  @ApiPropertyOptional({ example: '+91', nullable: true })
  callingCode: string | null;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiPropertyOptional({ type: 'string', format: 'date-time', nullable: true })
  updatedAt: Date | null;

  @ApiProperty({ example: true })
  canDelete: boolean;

  static from(country: Country, canDelete = true): CountryDto {
    const dto = new CountryDto();
    dto.id = country.id;
    dto.code = country.code;
    dto.name = country.name;
    dto.defaultCurrency = country.defaultCurrency;
    dto.taxRegime = country.taxRegime;
    dto.taxIdLabel = country.taxIdLabel;
    dto.taxIdPattern = country.taxIdPattern;
    dto.callingCode = country.callingCode;
    dto.isActive = country.isActive;
    dto.createdAt = country.createdAt;
    dto.updatedAt = country.updatedAt;
    dto.canDelete = canDelete;
    return dto;
  }
}
