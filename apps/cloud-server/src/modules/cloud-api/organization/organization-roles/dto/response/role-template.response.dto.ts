import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { FeatureUnlocks, ScopeType, SiteType } from '@vritti/api-sdk/catalog-resolver';

export class RoleTemplateResponseDto {
  @ApiProperty({ example: 'cashier' })
  code: string;

  @ApiProperty({ example: 'Admin' })
  name: string;

  @ApiPropertyOptional({ example: 'Full access at the counter' })
  description?: string;

  @ApiProperty({ enum: ['ORG', 'LE', 'SITE_GROUP', 'SITE'], example: 'SITE' })
  scope: ScopeType;

  @ApiPropertyOptional({ enum: ['OUTLET', 'WAREHOUSE', 'PRODUCTION'], example: 'OUTLET' })
  siteType?: SiteType;

  @ApiProperty({
    example: { 'crm.leads': { web: ['VIEW', 'CREATE', 'EDIT'], mobile: ['VIEW'] } },
    description: 'Feature code to per-platform granted permission codes',
  })
  features: FeatureUnlocks;
}
