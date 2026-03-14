import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { TableViewState } from '@vritti/api-sdk';
import { TableResponseDto } from '@vritti/api-sdk';
import { NexusUserResponseDto } from './nexus-user-response.dto';

export class UsersTableResponseDto extends TableResponseDto<NexusUserResponseDto> {
  @ApiProperty({ type: [NexusUserResponseDto] })
  declare result: NexusUserResponseDto[];

  @ApiProperty()
  declare count: number;

  @ApiProperty({ description: 'Current active filter/sort/visibility state' })
  declare state: TableViewState;

  @ApiPropertyOptional()
  declare activeViewId: string | null;
}
