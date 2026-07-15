import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { ScopeType, SiteType } from '@vritti/api-sdk/catalog-resolver';

export class CoreRoleDto {
  @ApiProperty({ example: 'uuid-here' })
  id: string;

  @ApiProperty({ example: 'uuid-here' })
  organizationId: string;

  @ApiProperty({ example: 'Cashier' })
  name: string;

  @ApiProperty({ enum: ['ORG', 'LE', 'SITE_GROUP', 'SITE'], example: 'SITE' })
  scope: ScopeType;

  @ApiPropertyOptional({ enum: ['OUTLET', 'WAREHOUSE', 'PRODUCTION'], example: 'OUTLET', nullable: true })
  siteType: SiteType | null;

  @ApiPropertyOptional({ example: 'Handles billing at the counter', nullable: true })
  description: string | null;

  @ApiPropertyOptional({ example: 'cashier', nullable: true })
  code: string | null;

  @ApiProperty({
    type: Object,
    example: { pos: ['VIEW', 'CREATE'] },
    description: 'Feature code to granted permission codes',
  })
  features: Record<string, string[]>;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: 3, description: 'Number of distinct users assigned this role' })
  assignedUserCount: number;

  @ApiProperty({ example: true, description: 'True when no user is assigned this role, so it is safe to delete' })
  canDelete: boolean;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  updatedAt: Date;
}
