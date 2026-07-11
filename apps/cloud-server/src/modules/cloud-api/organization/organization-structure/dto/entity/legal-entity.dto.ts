import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { type TaxRegime, TaxRegimeValues } from '@/db/schema/enums';

export class LegalEntityDto {
  @ApiProperty({ example: 'uuid-here' })
  id: string;

  @ApiProperty({ example: 'uuid-here' })
  organizationId: string;

  @ApiProperty({ example: 'acme-india' })
  code: string;

  @ApiProperty({ example: 'Acme Pharma Pvt Ltd' })
  name: string;

  @ApiProperty({ example: 'IN' })
  country: string;

  @ApiProperty({ example: 'INR' })
  currencyCode: string;

  @ApiProperty({ enum: TaxRegimeValues, example: 'GST' })
  taxRegime: TaxRegime;

  @ApiPropertyOptional({ example: 'AAACA1234F', nullable: true })
  taxId: string | null;

  @ApiProperty({ example: 4 })
  fiscalYearStart: number;

  @ApiPropertyOptional({ example: 'uuid-here', nullable: true })
  parentId: string | null;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  updatedAt: string;
}
