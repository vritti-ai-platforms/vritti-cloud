import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TableResponseDto } from '@vritti/api-sdk';
import type { TableViewState } from '@vritti/api-sdk';
import { RoleDto } from '../entity/role.dto';

export class RoleTableResponseDto extends TableResponseDto<RoleDto> {
  @ApiProperty({ type: [RoleDto] })
  declare result: RoleDto[];

  @ApiProperty()
  declare count: number;

  @ApiProperty({ description: 'Current active filter/sort/visibility state' })
  declare state: TableViewState;

  @ApiPropertyOptional()
  declare activeViewId: string | null;
}
