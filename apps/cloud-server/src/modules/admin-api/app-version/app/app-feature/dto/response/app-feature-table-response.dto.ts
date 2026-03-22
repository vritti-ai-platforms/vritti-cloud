import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TableResponseDto } from '@vritti/api-sdk';
import type { TableViewState } from '@vritti/api-sdk';
import { AppFeatureTableRowDto } from '../entity/app-feature-table-row.dto';

export class AppFeatureTableResponseDto extends TableResponseDto<AppFeatureTableRowDto> {
  @ApiProperty({ type: [AppFeatureTableRowDto] })
  declare result: AppFeatureTableRowDto[];

  @ApiProperty()
  declare count: number;

  @ApiProperty({ description: 'Current active filter/sort/visibility state' })
  declare state: TableViewState;

  @ApiPropertyOptional()
  declare activeViewId: string | null;
}
