import { ApiProperty } from '@nestjs/swagger';

export class PermissionUsageRefDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'Pro' })
  name: string;
}

export class PermissionUsageBusinessDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440010' })
  businessId: string;

  @ApiProperty({ example: 'Pharmacy' })
  businessName: string;

  @ApiProperty({ type: [PermissionUsageRefDto], description: 'Plans (in this business) that unlock the permission' })
  plans: PermissionUsageRefDto[];

  @ApiProperty({ type: [PermissionUsageRefDto], description: 'Role templates (in this business) that grant it' })
  roleTemplates: PermissionUsageRefDto[];
}

export class PermissionUsageResponseDto {
  @ApiProperty({ type: [PermissionUsageBusinessDto], description: 'Usage grouped by business' })
  businesses: PermissionUsageBusinessDto[];

  @ApiProperty({ example: 3, description: 'Total distinct plans using the permission' })
  planCount: number;

  @ApiProperty({ example: 2, description: 'Total distinct role templates using the permission' })
  roleTemplateCount: number;
}
