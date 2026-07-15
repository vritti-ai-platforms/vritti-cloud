import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SelectOptionsQueryDto } from '@vritti/api-sdk/database';
import { IsOptional, IsUUID } from 'class-validator';

export class OrgStructureSelectQueryDto extends SelectOptionsQueryDto {
  @ApiProperty({ description: 'Organization ID to fetch structure for', example: 'uuid-here' })
  @IsUUID()
  orgId: string;

  @ApiPropertyOptional({
    description: 'Exclude this node and its entire descendant subtree',
    example: 'uuid-here',
  })
  @IsOptional()
  @IsUUID()
  excludeId?: string;
}
