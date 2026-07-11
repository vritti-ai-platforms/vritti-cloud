import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CoreRoleDto {
  @ApiProperty({ example: 'uuid-here' })
  id: string;

  @ApiProperty({ example: 'uuid-here' })
  organizationId: string;

  @ApiProperty({ example: 'Cashier' })
  name: string;

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

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  updatedAt: Date;
}
