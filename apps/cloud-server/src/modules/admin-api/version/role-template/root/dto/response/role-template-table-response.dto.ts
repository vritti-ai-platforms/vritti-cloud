import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { TableViewState } from '@vritti/api-sdk';
import { TableResponseDto } from '@vritti/api-sdk';
import { RoleTemplateTableRowDto } from '../entity/role-template-table-row.dto';

export class RoleTemplateTableResponseDto extends TableResponseDto<RoleTemplateTableRowDto> {
  @ApiProperty({ type: [RoleTemplateTableRowDto] })
  declare result: RoleTemplateTableRowDto[];

  @ApiProperty()
  declare count: number;

  @ApiProperty({ description: 'Current active filter/sort/visibility state' })
  declare state: TableViewState;

  @ApiPropertyOptional()
  declare activeViewId: string | null;
}
