import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class AssignFeaturesToAppDto {
  @ApiProperty({
    description: 'App (of this business) to pin the selected features to',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  appId: string;

  @ApiProperty({
    type: [String],
    description: 'Feature ids to add to this business under the app',
    example: ['550e8400-e29b-41d4-a716-446655440001'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  featureIds: string[];
}
