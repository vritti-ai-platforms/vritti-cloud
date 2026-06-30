import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayUnique, IsArray, IsEnum, IsUUID, ValidateNested } from 'class-validator';
import { type AppPlatform, AppPlatformValues } from '@/db/schema';

export class PlanUnlockDto {
  @ApiProperty({
    description: 'Feature unlocked in this plan on this platform (the route/unlock gate)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  featureId: string;

  @ApiProperty({ description: 'Platform this unlock applies to', enum: ['WEB', 'MOBILE'], example: 'WEB' })
  @IsEnum(AppPlatformValues)
  platform: AppPlatform;

  @ApiProperty({
    description: 'Feature-permission ids unlocked under this unlock (empty = unlocked but view-only)',
    type: [String],
    example: ['550e8400-e29b-41d4-a716-446655440000'],
  })
  @IsArray()
  @IsUUID('all', { each: true })
  permissions: string[];
}

export class SetPlanUnlockedDto {
  @ApiProperty({
    description: 'Per-platform feature unlocks, each with its unlocked permissions (full replace)',
    type: [PlanUnlockDto],
  })
  @IsArray()
  @ArrayUnique((u: PlanUnlockDto) => `${u.featureId}:${u.platform}`)
  @ValidateNested({ each: true })
  @Type(() => PlanUnlockDto)
  unlocks: PlanUnlockDto[];
}
