import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsUUID } from 'class-validator';

export class SetFeatureAppsDto {
  @ApiProperty({
    type: [String],
    description: 'Apps (of this business) the feature should be assigned to',
    example: ['550e8400-e29b-41d4-a716-446655440000'],
  })
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  appIds: string[];
}
