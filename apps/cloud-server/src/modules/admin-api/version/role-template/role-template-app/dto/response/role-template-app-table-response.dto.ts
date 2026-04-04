import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TableResponseDto } from '@vritti/api-sdk';
import type { TableViewState } from '@vritti/api-sdk';
import { RoleTemplateAppTableRowDto } from '../entity/role-template-app-table-row.dto';

export class RoleTemplateAppTableResponseDto extends TableResponseDto<RoleTemplateAppTableRowDto> {
  @ApiProperty({ type: [RoleTemplateAppTableRowDto] })
  declare result: RoleTemplateAppTableRowDto[];

  @ApiProperty()
  declare count: number;

  @ApiProperty({ description: 'Current active filter/sort/visibility state' })
  declare state: TableViewState;

  @ApiPropertyOptional()
  declare activeViewId: string | null;
}
