import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TableResponseDto, type TableViewState } from '@vritti/api-sdk/database';
import { FeaturePermissionDto } from '@/modules/admin-api/version/permission/dto/entity/feature-permission.dto';

export class BusinessPermissionTableResponseDto extends TableResponseDto<FeaturePermissionDto> {
  @ApiProperty({ type: [FeaturePermissionDto] })
  declare result: FeaturePermissionDto[];

  @ApiProperty()
  declare count: number;

  @ApiProperty({ description: 'Current active filter/sort/visibility state' })
  declare state: TableViewState;

  @ApiPropertyOptional({ nullable: true })
  declare activeViewId: string | null;
}
