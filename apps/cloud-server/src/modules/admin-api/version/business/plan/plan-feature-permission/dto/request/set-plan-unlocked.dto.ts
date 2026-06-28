import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayUnique, IsArray, IsEnum, IsUUID, ValidateNested } from 'class-validator';
import { type AppPlatform, AppPlatformValues } from '@/db/schema';

export class PlanMembershipDto {
  @ApiProperty({
    description: 'Feature included in this plan on this platform (the unlock/route gate)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  featureId: string;

  @ApiProperty({ description: 'Platform this membership applies to', enum: ['WEB', 'MOBILE'], example: 'WEB' })
  @IsEnum(AppPlatformValues)
  platform: AppPlatform;

  @ApiProperty({
    description: 'Feature-permission ids unlocked under this membership (empty = included but view-only)',
    type: [String],
    example: ['550e8400-e29b-41d4-a716-446655440000'],
  })
  @IsArray()
  @IsUUID('all', { each: true })
  permissions: string[];
}

export class SetPlanUnlockedDto {
  @ApiProperty({
    description: 'Per-platform feature memberships, each with its unlocked permissions (full replace)',
    type: [PlanMembershipDto],
  })
  @IsArray()
  @ArrayUnique((m: PlanMembershipDto) => `${m.featureId}:${m.platform}`)
  @ValidateNested({ each: true })
  @Type(() => PlanMembershipDto)
  memberships: PlanMembershipDto[];
}
