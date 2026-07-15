import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SelectOptionsQueryDto } from '@vritti/api-sdk/database';
import { IsIn, IsOptional, IsUUID } from 'class-validator';

export type RoleSelectScope = 'ORG' | 'LE' | 'SITE_GROUP' | 'SITE';

export class RoleSelectQueryDto extends SelectOptionsQueryDto {
  @ApiProperty({ description: 'Organization ID to fetch roles for', example: 'uuid-here' })
  @IsUUID()
  orgId: string;

  @ApiProperty({ description: 'Exact assignment scope to match', example: 'SITE' })
  @IsIn(['ORG', 'LE', 'SITE_GROUP', 'SITE'])
  scope: RoleSelectScope;

  @ApiPropertyOptional({
    description: "Target site ID — resolves the site's type for SITE scope",
    example: 'uuid-here',
  })
  @IsOptional()
  @IsUUID()
  siteId?: string;
}
