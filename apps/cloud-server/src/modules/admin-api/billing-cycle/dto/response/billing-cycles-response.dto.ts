import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { TableViewState } from '@vritti/api-sdk';
import { TableResponseDto } from '@vritti/api-sdk';
import { BillingCycleDto } from '../entity/billing-cycle.dto';

export class BillingCycleTableResponseDto extends TableResponseDto<BillingCycleDto> {
  @ApiProperty({ type: [BillingCycleDto] })
  declare result: BillingCycleDto[];

  @ApiProperty()
  declare count: number;

  @ApiProperty({ description: 'Current active filter/sort/visibility state' })
  declare state: TableViewState;

  @ApiPropertyOptional()
  declare activeViewId: string | null;
}
