import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { TableViewState } from '@vritti/api-sdk/database';
import { TableResponseDto } from '@vritti/api-sdk/database';
import { VersionBusinessDto } from '@/modules/admin-api/business/dto/entity/version-business.dto';

export class VersionBusinessTableResponseDto extends TableResponseDto<VersionBusinessDto> {
  @ApiProperty({ type: [VersionBusinessDto] })
  declare result: VersionBusinessDto[];

  @ApiProperty()
  declare count: number;

  @ApiProperty({ description: 'Current active filter/sort/visibility state' })
  declare state: TableViewState;

  @ApiPropertyOptional()
  declare activeViewId: string | null;
}
