import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayUnique, IsArray, IsEnum, IsUUID, ValidateNested } from 'class-validator';
import { type AppPlatform, AppPlatformValues } from '@/db/schema';

export class PlanUnlockGrantDto {
  @ApiProperty({ description: 'Feature permission ID to unlock', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  featurePermissionId: string;

  @ApiProperty({ description: 'Platform this unlock applies to', enum: ['WEB', 'MOBILE'], example: 'WEB' })
  @IsEnum(AppPlatformValues)
  platform: AppPlatform;
}

export class SetPlanUnlockedDto {
  @ApiProperty({
    description: 'Platform-scoped permission unlocks for the plan (full replace)',
    type: [PlanUnlockGrantDto],
  })
  @IsArray()
  @ArrayUnique((g: PlanUnlockGrantDto) => `${g.featurePermissionId}:${g.platform}`)
  @ValidateNested({ each: true })
  @Type(() => PlanUnlockGrantDto)
  grants: PlanUnlockGrantDto[];
}
