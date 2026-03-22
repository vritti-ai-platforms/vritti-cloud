import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TableResponseDto } from '@vritti/api-sdk';
import type { TableViewState } from '@vritti/api-sdk';
import { AppVersionDto } from '../entity/app-version.dto';

export class AppVersionTableResponseDto extends TableResponseDto<AppVersionDto> {
  @ApiProperty({ type: [AppVersionDto] })
  declare result: AppVersionDto[];

  @ApiProperty()
  declare count: number;

  @ApiProperty({ description: 'Current active filter/sort/visibility state' })
  declare state: TableViewState;

  @ApiPropertyOptional()
  declare activeViewId: string | null;
}
