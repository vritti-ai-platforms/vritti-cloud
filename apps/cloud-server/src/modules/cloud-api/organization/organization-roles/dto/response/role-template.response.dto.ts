import { ApiProperty } from '@nestjs/swagger';
import type { FeatureUnlocks } from '@vritti/api-sdk/catalog-resolver';

export class RoleTemplateResponseDto {
  @ApiProperty({ example: 'cashier' })
  code: string;

  @ApiProperty({ example: 'Admin' })
  name: string;

  @ApiProperty({
    example: { 'crm.leads': { web: ['VIEW', 'CREATE', 'EDIT'], mobile: ['VIEW'] } },
    description: 'Feature code to per-platform granted permission codes',
  })
  features: FeatureUnlocks;
}

export class RoleTemplateListResponseDto {
  @ApiProperty({ type: [RoleTemplateResponseDto] })
  result: RoleTemplateResponseDto[];
}
