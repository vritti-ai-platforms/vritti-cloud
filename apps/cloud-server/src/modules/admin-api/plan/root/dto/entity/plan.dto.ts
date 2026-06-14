import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Plan } from '@/db/schema';

export class PlanDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  businessId: string;

  @ApiProperty({ example: 'Pharmacy' })
  businessName: string;

  @ApiProperty({ example: 'Pro' })
  name: string;

  @ApiProperty({ example: 'pro' })
  code: string;

  @ApiPropertyOptional({ example: 50, nullable: true })
  maxBusinessUnits: number | null;

  @ApiPropertyOptional({ example: 9900, description: 'USD anchor in minor units, reference only', nullable: true })
  usdAnchor: number | null;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiPropertyOptional({ type: 'string', format: 'date-time', nullable: true })
  updatedAt: Date | null;

  @ApiProperty({ example: 2 })
  priceCount: number;

  @ApiProperty({ example: 2 })
  marketCount: number;

  @ApiProperty({ example: 1 })
  orgCount: number;

  @ApiProperty({ example: true })
  canDelete: boolean;

  @ApiPropertyOptional({ nullable: true })
  content: string | null;

  static from(
    plan: Plan,
    counts: { priceCount?: number; orgCount?: number; marketCount?: number; businessName?: string } = {},
    canDelete = true,
  ): PlanDto {
    const dto = new PlanDto();
    dto.id = plan.id;
    dto.businessId = plan.businessId;
    dto.businessName = counts.businessName ?? '';
    dto.name = plan.name;
    dto.code = plan.code;
    dto.maxBusinessUnits = plan.maxBusinessUnits ?? null;
    dto.usdAnchor = plan.usdAnchor ?? null;
    dto.content = plan.content ?? null;
    dto.createdAt = plan.createdAt;
    dto.updatedAt = plan.updatedAt;
    dto.priceCount = counts.priceCount ?? 0;
    dto.marketCount = counts.marketCount ?? 0;
    dto.orgCount = counts.orgCount ?? 0;
    dto.canDelete = canDelete;
    return dto;
  }
}
