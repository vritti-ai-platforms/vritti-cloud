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

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiPropertyOptional({ type: 'string', format: 'date-time', nullable: true })
  updatedAt: Date | null;

  @ApiProperty({ example: 2 })
  priceCount: number;

  @ApiProperty({ example: 2 })
  countryCount: number;

  @ApiProperty({ example: 1 })
  orgCount: number;

  @ApiProperty({ example: false, description: 'Bespoke plan attached to a single organization' })
  isCustom: boolean;

  @ApiPropertyOptional({
    example: 'Acme Corp',
    nullable: true,
    description: 'Organization a custom plan is attached to',
  })
  attachedOrgName: string | null;

  @ApiProperty({ example: true })
  canDelete: boolean;

  @ApiPropertyOptional({ nullable: true })
  content: string | null;

  static from(
    plan: Plan,
    counts: {
      priceCount?: number;
      orgCount?: number;
      countryCount?: number;
      businessName?: string;
      attachedOrgName?: string | null;
    } = {},
    canDelete = true,
  ): PlanDto {
    const dto = new PlanDto();
    dto.id = plan.id;
    dto.businessId = plan.businessId;
    dto.businessName = counts.businessName ?? '';
    dto.name = plan.name;
    dto.code = plan.code;
    dto.isCustom = plan.isCustom;
    dto.attachedOrgName = counts.attachedOrgName ?? null;
    dto.maxBusinessUnits = plan.maxBusinessUnits ?? null;
    dto.content = plan.content ?? null;
    dto.createdAt = plan.createdAt;
    dto.updatedAt = plan.updatedAt;
    dto.priceCount = counts.priceCount ?? 0;
    dto.countryCount = counts.countryCount ?? 0;
    dto.orgCount = counts.orgCount ?? 0;
    dto.canDelete = canDelete;
    return dto;
  }
}
