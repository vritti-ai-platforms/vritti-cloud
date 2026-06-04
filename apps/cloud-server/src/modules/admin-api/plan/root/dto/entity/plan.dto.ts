import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Plan } from '@/db/schema';

export class PlanDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'Pro' })
  name: string;

  @ApiProperty({ example: 'pro' })
  code: string;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiPropertyOptional({ type: 'string', format: 'date-time', nullable: true })
  updatedAt: Date | null;

  @ApiProperty({ example: 2 })
  priceCount: number;

  @ApiProperty({ example: 3 })
  regionCount: number;

  @ApiProperty({ example: 2 })
  providerCount: number;

  @ApiProperty({ example: 1 })
  orgCount: number;

  @ApiProperty({ example: true })
  canDelete: boolean;

  @ApiPropertyOptional({ nullable: true })
  content: string | null;

  static from(
    plan: Plan,
    counts: { priceCount?: number; regionCount?: number; providerCount?: number; orgCount?: number } = {},
    canDelete = true,
  ): PlanDto {
    const dto = new PlanDto();
    dto.id = plan.id;
    dto.name = plan.name;
    dto.code = plan.code;
    dto.content = plan.content ?? null;
    dto.createdAt = plan.createdAt;
    dto.updatedAt = plan.updatedAt;
    dto.priceCount = counts.priceCount ?? 0;
    dto.regionCount = counts.regionCount ?? 0;
    dto.providerCount = counts.providerCount ?? 0;
    dto.orgCount = counts.orgCount ?? 0;
    dto.canDelete = canDelete;
    return dto;
  }
}
