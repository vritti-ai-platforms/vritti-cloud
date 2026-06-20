import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Business } from '@/db/schema';

export class BusinessDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'Healthcare' })
  name: string;

  @ApiProperty({ example: 'healthcare' })
  code: string;

  @ApiPropertyOptional({ example: 'Healthcare and medical services', nullable: true })
  description: string | null;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiPropertyOptional({ type: 'string', format: 'date-time', nullable: true })
  updatedAt: Date | null;

  @ApiProperty({
    example: true,
    description: 'False when the business is referenced by organizations, plans, apps, or role templates',
  })
  canDelete: boolean;

  static from(business: Business, canDelete = true): BusinessDto {
    const dto = new BusinessDto();
    dto.id = business.id;
    dto.name = business.name;
    dto.code = business.code;
    dto.description = business.description;
    dto.createdAt = business.createdAt;
    dto.updatedAt = business.updatedAt;
    dto.canDelete = canDelete;
    return dto;
  }
}
