import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class SetPlanUnlockedDto {
  @ApiProperty({ description: 'The feature-permission ids this plan unlocks', type: [String] })
  @IsArray()
  @IsUUID('all', { each: true })
  featurePermissionIds: string[];
}
