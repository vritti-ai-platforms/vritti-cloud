import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, MaxLength, Min, MinLength } from 'class-validator';

export class CreatePlanDto {
  @ApiProperty({
    description: 'Vertical (business) UUID this plan belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  businessId: string;

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

  @ApiPropertyOptional({ description: 'Maximum business units allowed on this plan', example: 50 })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxBusinessUnits?: number;

  @ApiPropertyOptional({ description: 'USD anchor amount in minor units, reference only', example: 9900 })
  @IsOptional()
  @IsInt()
  @Min(0)
  usdAnchor?: number;

  @ApiPropertyOptional({ description: 'Rich content stored as Lexical JSON', nullable: true })
  @IsOptional()
  @IsString()
  content?: string;
}
