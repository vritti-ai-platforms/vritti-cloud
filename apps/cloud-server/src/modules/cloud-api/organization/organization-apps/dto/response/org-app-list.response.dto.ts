import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrgAppFeatureDto {
  @ApiProperty({ example: 'crm.leads' })
  code: string;

  @ApiProperty({ example: 'Leads' })
  name: string;
}

export class OrgAppPriceDto {
  @ApiProperty({ example: '499.00' })
  monthlyPrice: string;

  @ApiProperty({ example: 'INR' })
  currency: string;
}

export class OrgAppItemResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'crm' })
  code: string;

  @ApiProperty({ example: 'CRM' })
  name: string;

  @ApiPropertyOptional({ example: 'Customer Relationship Management' })
  description?: string | null;

  @ApiPropertyOptional({ example: 'briefcase' })
  icon?: string | null;

  @ApiProperty({ example: 'included', enum: ['included', 'addon', 'unavailable', 'enabled'] })
  status: 'included' | 'addon' | 'unavailable' | 'enabled';

  @ApiPropertyOptional({ type: OrgAppPriceDto })
  price?: OrgAppPriceDto | null;

  @ApiProperty({ type: [OrgAppFeatureDto] })
  features: OrgAppFeatureDto[];
}

export class OrgAppListResponseDto {
  @ApiProperty({ type: [OrgAppItemResponseDto] })
  result: OrgAppItemResponseDto[];
}

export class OrgPermissionFeatureDto {
  @ApiProperty({ example: 'crm.leads' })
  code: string;

  @ApiProperty({ example: 'Leads' })
  name: string;

  @ApiProperty({ example: ['VIEW', 'CREATE', 'EDIT', 'DELETE'] })
  permissions: string[];
}

export class OrgPermissionAppResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  appId: string;

  @ApiProperty({ example: 'crm' })
  appCode: string;

  @ApiProperty({ example: 'CRM' })
  appName: string;

  @ApiProperty({ type: [OrgPermissionFeatureDto] })
  features: OrgPermissionFeatureDto[];
}

export class OrgPermissionsResponseDto {
  @ApiProperty({ type: [OrgPermissionAppResponseDto] })
  apps: OrgPermissionAppResponseDto[];
}
