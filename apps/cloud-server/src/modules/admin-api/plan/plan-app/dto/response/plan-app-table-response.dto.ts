import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TableResponseDto } from '@vritti/api-sdk';
import type { TableViewState } from '@vritti/api-sdk';
import { PlanAppTableRowDto } from '../entity/plan-app-table-row.dto';

export class PlanAppTableResponseDto extends TableResponseDto<PlanAppTableRowDto> {
  @ApiProperty({ type: [PlanAppTableRowDto] })
  declare result: PlanAppTableRowDto[];

  @ApiProperty()
  declare count: number;

  @ApiProperty({ description: 'Current active filter/sort/visibility state' })
  declare state: TableViewState;

  @ApiPropertyOptional()
  declare activeViewId: string | null;
}
