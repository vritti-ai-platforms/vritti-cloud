import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class RemoveBusinessFeaturesDto {
  @ApiProperty({
    type: [String],
    description: 'Feature ids to remove from this business (unassigns each from its app)',
    example: ['550e8400-e29b-41d4-a716-446655440000'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  featureIds: string[];
}
