import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TableResponseDto } from '@vritti/api-sdk';
import type { TableViewState } from '@vritti/api-sdk';
import { MicrofrontendDto } from '../entity/microfrontend.dto';

export class MicrofrontendTableResponseDto extends TableResponseDto<MicrofrontendDto> {
  @ApiProperty({ type: [MicrofrontendDto] })
  declare result: MicrofrontendDto[];

  @ApiProperty()
  declare count: number;

  @ApiProperty({ description: 'Current active filter/sort/visibility state' })
  declare state: TableViewState;

  @ApiPropertyOptional()
  declare activeViewId: string | null;
}
