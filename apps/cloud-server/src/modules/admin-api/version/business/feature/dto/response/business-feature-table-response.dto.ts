import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TableResponseDto, type TableViewState } from '@vritti/api-sdk';
import { BusinessFeatureDto } from '../entity/business-feature.dto';

export class BusinessFeatureTableResponseDto extends TableResponseDto<BusinessFeatureDto> {
  @ApiProperty({ type: [BusinessFeatureDto] })
  declare result: BusinessFeatureDto[];

  @ApiProperty()
  declare count: number;

  @ApiProperty({ description: 'Current active filter/sort/visibility state' })
  declare state: TableViewState;

  @ApiPropertyOptional({ nullable: true })
  declare activeViewId: string | null;
}
