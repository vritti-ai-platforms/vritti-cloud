import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Length, Max, Min } from 'class-validator';
import { type TaxRegime, TaxRegimeValues } from '@/db/schema/enums';

export class UpdateLegalEntityDto {
  @ApiPropertyOptional({ example: 'acme-india' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  code?: string;

  @ApiPropertyOptional({ example: 'Acme Pharma Pvt Ltd' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ description: 'Country (ISO 3166-1 alpha-2)', example: 'IN' })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  country?: string;

  @ApiPropertyOptional({ description: 'Base currency (ISO 4217)', example: 'INR' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currencyCode?: string;

  @ApiPropertyOptional({ enum: TaxRegimeValues, example: 'GST' })
  @IsOptional()
  @IsEnum(TaxRegimeValues)
  taxRegime?: TaxRegime;

  @ApiPropertyOptional({ example: 'AAACA1234F' })
  @IsOptional()
  @IsString()
  taxId?: string;

  @ApiPropertyOptional({ description: 'Fiscal year start month (1-12)', example: 4 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  fiscalYearStart?: number;

  @ApiPropertyOptional({ description: 'Parent legal entity ID (subsidiary)', example: 'uuid-here' })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
