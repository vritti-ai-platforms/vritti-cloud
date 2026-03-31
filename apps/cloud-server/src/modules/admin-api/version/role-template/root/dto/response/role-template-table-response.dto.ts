import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TableResponseDto } from '@vritti/api-sdk';
import type { TableViewState } from '@vritti/api-sdk';
import { RoleTemplateDto } from '../entity/role-template.dto';

export class RoleTemplateTableResponseDto extends TableResponseDto<RoleTemplateDto> {
  @ApiProperty({ type: [RoleTemplateDto] })
  declare result: RoleTemplateDto[];

  @ApiProperty()
  declare count: number;

  @ApiProperty({ description: 'Current active filter/sort/visibility state' })
  declare state: TableViewState;

  @ApiPropertyOptional()
  declare activeViewId: string | null;
}
