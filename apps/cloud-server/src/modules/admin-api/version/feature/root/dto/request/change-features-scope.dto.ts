import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsEnum, IsUUID } from 'class-validator';
import { type ScopeType, ScopeTypeValues } from '@/db/schema/enums';

export class ChangeFeaturesScopeDto {
  @ApiProperty({
    type: [String],
    description: 'Feature ids to update',
    example: ['550e8400-e29b-41d4-a716-446655440000'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  featureIds: string[];

  @ApiProperty({ enum: ScopeTypeValues, example: 'SITE' })
  @IsEnum(ScopeTypeValues)
  scope: ScopeType;
}
