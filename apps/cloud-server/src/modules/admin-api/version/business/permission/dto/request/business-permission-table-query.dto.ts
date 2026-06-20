import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class BusinessPermissionTableQueryDto {
  @ApiPropertyOptional({
    description: 'Filter permissions by feature',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  featureId?: string;
}
