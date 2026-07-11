import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min, MinLength } from 'class-validator';

export class CreatePlanDto {
  @ApiPropertyOptional({
    description: 'Business UUID. Required for standard plans; derived from the org for custom plans.',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  businessId?: string;

  @ApiPropertyOptional({
    description: 'Whether this is a bespoke plan attached to a single organization',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isCustom?: boolean;

  @ApiPropertyOptional({
    description: 'Organization UUID to attach this custom plan to (required when isCustom is true)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @ApiProperty({ description: 'Display name of the plan', example: 'Pro' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Unique code identifier for the plan', example: 'pro' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  code: string;

  @ApiPropertyOptional({ description: 'Maximum sites allowed on this plan', example: 50 })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxSites?: number;

  @ApiPropertyOptional({ description: 'Rich content stored as Lexical JSON', nullable: true })
  @IsOptional()
  @IsString()
  content?: string;
}
