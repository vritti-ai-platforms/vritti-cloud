import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';
import { BusinessVocabularyDto } from '../entity/business-vocabulary.dto';

export class CreateBusinessDto {
  @ApiProperty({ description: 'Display name of the business', example: 'Healthcare' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Unique code identifier for the business', example: 'healthcare' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  code: string;

  @ApiPropertyOptional({
    description: 'Optional description of the business',
    example: 'Healthcare and medical services',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    type: BusinessVocabularyDto,
    description: 'Display vocabulary overrides for site/siteGroup/outlet/warehouse/production (singular + plural)',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BusinessVocabularyDto)
  vocabulary?: BusinessVocabularyDto;
}
