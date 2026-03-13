import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { TableViewState } from '@vritti/api-sdk';
import { TableResponseDto } from '@vritti/api-sdk';
import { OrganizationDto } from '../entity/organization.dto';

export class OrganizationTableResponseDto extends TableResponseDto<OrganizationDto> {
  @ApiProperty({ type: [OrganizationDto] })
  declare result: OrganizationDto[];

  @ApiProperty()
  declare count: number;

  @ApiProperty({ description: 'Current active filter/sort/visibility state' })
  declare state: TableViewState;

  @ApiPropertyOptional()
  declare activeViewId: string | null;
}
