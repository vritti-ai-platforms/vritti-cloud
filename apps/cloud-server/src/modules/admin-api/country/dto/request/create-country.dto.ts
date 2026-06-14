import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { type TaxRegime, TaxRegimeValues } from '@/db/schema';

export class CreateCountryDto {
  @ApiProperty({ description: 'ISO 3166-1 alpha-2 country code', example: 'IN' })
  @IsString()
  @Length(2, 2)
  code: string;

  @ApiProperty({ description: 'Display name of the country', example: 'India' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'ISO 4217 default currency code', example: 'INR' })
  @IsString()
  @Length(3, 3)
  defaultCurrency: string;

  @ApiProperty({ description: 'Tax regime of the country', enum: TaxRegimeValues, example: 'GST' })
  @IsEnum(TaxRegimeValues)
  taxRegime: TaxRegime;

  @ApiPropertyOptional({ description: 'Label for the tax identifier', example: 'GSTIN' })
  @IsOptional()
  @IsString()
  taxIdLabel?: string;

  @ApiPropertyOptional({ description: 'Validation pattern for the tax identifier' })
  @IsOptional()
  @IsString()
  taxIdPattern?: string;

  @ApiPropertyOptional({ description: 'International calling code', example: '+91' })
  @IsOptional()
  @IsString()
  callingCode?: string;

  @ApiPropertyOptional({ description: 'Whether the country is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
