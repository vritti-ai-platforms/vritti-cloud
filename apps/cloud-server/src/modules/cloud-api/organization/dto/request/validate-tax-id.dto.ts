import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class ValidateTaxIdDto {
  @ApiProperty({ description: 'Country UUID the tax id belongs to', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  countryId: string;

  @ApiProperty({ description: 'Tax identifier (GSTIN for India, TRN for UAE)', example: '29ABCDE1234F1Z5' })
  @IsNotEmpty()
  @IsString()
  taxId: string;
}
