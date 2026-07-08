import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { TableViewState } from '@vritti/api-sdk/database';
import { TableResponseDto } from '@vritti/api-sdk/database';
import { OrganizationMemberDto } from '../entity/organization-member.dto';

export class OrganizationMemberTableResponseDto extends TableResponseDto<OrganizationMemberDto> {
  @ApiProperty({ type: [OrganizationMemberDto] })
  declare result: OrganizationMemberDto[];

  @ApiProperty()
  declare count: number;

  @ApiProperty({ description: 'Current active filter/sort/visibility state' })
  declare state: TableViewState;

  @ApiPropertyOptional()
  declare activeViewId: string | null;
}
