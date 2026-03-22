import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class AssignFeaturesDto {
  @ApiProperty({ description: 'Feature UUIDs to assign to the app', type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  featureIds: string[];
}
