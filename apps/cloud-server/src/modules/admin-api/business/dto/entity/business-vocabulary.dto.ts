import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';

export class VocabularyEntryDto {
  @ApiProperty({ description: 'Singular display label', example: 'Store' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  singular: string;

  @ApiProperty({ description: 'Plural display label', example: 'Stores' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  plural: string;
}

export class BusinessVocabularyDto {
  @ApiPropertyOptional({ type: VocabularyEntryDto, description: 'Label override for "site"' })
  @IsOptional()
  @ValidateNested()
  @Type(() => VocabularyEntryDto)
  site?: VocabularyEntryDto;

  @ApiPropertyOptional({ type: VocabularyEntryDto, description: 'Label override for "site group"' })
  @IsOptional()
  @ValidateNested()
  @Type(() => VocabularyEntryDto)
  siteGroup?: VocabularyEntryDto;

  @ApiPropertyOptional({ type: VocabularyEntryDto, description: 'Label override for "outlet"' })
  @IsOptional()
  @ValidateNested()
  @Type(() => VocabularyEntryDto)
  outlet?: VocabularyEntryDto;

  @ApiPropertyOptional({ type: VocabularyEntryDto, description: 'Label override for "warehouse"' })
  @IsOptional()
  @ValidateNested()
  @Type(() => VocabularyEntryDto)
  warehouse?: VocabularyEntryDto;

  @ApiPropertyOptional({ type: VocabularyEntryDto, description: 'Label override for "production"' })
  @IsOptional()
  @ValidateNested()
  @Type(() => VocabularyEntryDto)
  production?: VocabularyEntryDto;
}
