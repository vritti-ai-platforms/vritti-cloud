import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class EnableAppDto {
  @ApiPropertyOptional({
    description: 'Optional list of feature codes to enable (defaults to all plan-included features)',
    example: ['crm.leads', 'crm.contacts'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  featureCodes?: string[];
}
