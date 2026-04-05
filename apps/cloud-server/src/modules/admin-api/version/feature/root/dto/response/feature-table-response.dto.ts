import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TableResponseDto } from '@vritti/api-sdk';
import type { TableViewState } from '@vritti/api-sdk';
import { FeatureDto } from '../entity/feature.dto';

export class FeatureTableResponseDto extends TableResponseDto<FeatureDto> {
  @ApiProperty({ type: [FeatureDto] })
  declare result: FeatureDto[];

  @ApiProperty()
  declare count: number;

  @ApiProperty({ description: 'Current active filter/sort/visibility state' })
  declare state: TableViewState;

  @ApiPropertyOptional()
  declare activeViewId: string | null;
}
