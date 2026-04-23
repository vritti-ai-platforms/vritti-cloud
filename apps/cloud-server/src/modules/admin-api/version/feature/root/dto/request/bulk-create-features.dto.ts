import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateFeatureDto } from './create-feature.dto';

export class BulkCreateFeaturesDto {
  @ApiProperty({ description: 'Array of features to create', type: [CreateFeatureDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFeatureDto)
  features: CreateFeatureDto[];
}
