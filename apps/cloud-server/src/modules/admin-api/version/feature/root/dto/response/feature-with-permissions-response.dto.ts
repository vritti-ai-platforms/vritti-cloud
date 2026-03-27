import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FeatureWithPermissionsResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'orders' })
  code: string;

  @ApiProperty({ example: 'Orders' })
  name: string;

  @ApiPropertyOptional({ example: 'clipboard-list', nullable: true })
  icon: string | null;

  @ApiProperty({ example: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'EXPORT'], type: [String] })
  permissions: string[];

  @ApiProperty({ example: ['order-management'], type: [String] })
  appCodes: string[];
}
