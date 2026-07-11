import { ApiProperty } from '@nestjs/swagger';
import type { PlatformBucket, SiteFeatureLocks } from '@vritti/api-sdk/catalog-resolver';

export class SiteMatrixCellDto {
  @ApiProperty({ description: "The org's plan unlocks this (feature, platform, permission)" })
  inPlan: boolean;

  @ApiProperty({ description: 'The site currently has it enabled (never true when inPlan is false)' })
  selected: boolean;

  @ApiProperty({ type: [String], description: 'Other plan names that unlock it — upsell; only when inPlan is false' })
  availableIn: string[];
}

export class SiteMatrixPermissionDto {
  @ApiProperty({ example: 'VIEW' })
  code: string;

  @ApiProperty({ example: 'View' })
  label: string;

  @ApiProperty({ type: SiteMatrixCellDto, nullable: true })
  web: SiteMatrixCellDto | null;

  @ApiProperty({ type: SiteMatrixCellDto, nullable: true })
  mobile: SiteMatrixCellDto | null;
}

export class SiteMatrixFeatureDto {
  @ApiProperty({ example: 'pos' })
  code: string;

  @ApiProperty({ example: 'POS Terminals' })
  name: string;

  @ApiProperty({ nullable: true, example: 'monitor' })
  icon: string | null;

  @ApiProperty({
    enum: ['web', 'mobile'],
    isArray: true,
    example: ['web', 'mobile'],
    description: 'Platforms the feature ships on',
  })
  platforms: PlatformBucket[];

  @ApiProperty({ description: 'Feature-level: is this feature a member of the org plan at all?' })
  inPlan: boolean;

  @ApiProperty({ type: [String], description: 'Plans that include the feature — upsell when inPlan is false' })
  availableIn: string[];

  @ApiProperty({ type: [SiteMatrixPermissionDto] })
  permissions: SiteMatrixPermissionDto[];
}

export class SiteMatrixAppDto {
  @ApiProperty({ example: 'pos' })
  code: string;

  @ApiProperty({ example: 'POS' })
  name: string;

  @ApiProperty({ nullable: true, example: 'scan-barcode' })
  icon: string | null;

  @ApiProperty({ description: '(feature × platform × permission) cells the plan unlocks' })
  unlockedCount: number;

  @ApiProperty({ description: 'All possible cells in this app' })
  totalCount: number;

  @ApiProperty({ type: [SiteMatrixFeatureDto] })
  features: SiteMatrixFeatureDto[];
}

export class SiteMatrixPlanDto {
  @ApiProperty({ example: 'essential' })
  code: string;

  @ApiProperty({ example: 'Essential' })
  name: string;
}

export class SiteMatrixResponseDto {
  @ApiProperty({ type: SiteMatrixPlanDto })
  plan: SiteMatrixPlanDto;

  @ApiProperty({ type: [SiteMatrixAppDto] })
  apps: SiteMatrixAppDto[];

  @ApiProperty({
    type: Object,
    description: 'The stored site deny-list — featureCode → { web?/mobile?: null (platform locked) | locked codes }',
  })
  locks: SiteFeatureLocks;
}
