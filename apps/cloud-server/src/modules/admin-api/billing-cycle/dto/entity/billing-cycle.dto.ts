import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { BillingCycle } from '@/db/schema';

export class BillingCycleDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'Monthly' })
  name: string;

  @ApiProperty({ example: 30 })
  days: number;

  @ApiProperty({ example: 0 })
  sortOrder: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiPropertyOptional({ type: 'string', format: 'date-time', nullable: true })
  updatedAt: Date | null;

  static from(row: BillingCycle): BillingCycleDto {
    const dto = new BillingCycleDto();
    dto.id = row.id;
    dto.name = row.name;
    dto.days = row.days;
    dto.sortOrder = row.sortOrder;
    dto.isActive = row.isActive;
    dto.createdAt = row.createdAt;
    dto.updatedAt = row.updatedAt;
    return dto;
  }
}
