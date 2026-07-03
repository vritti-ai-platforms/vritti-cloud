import { ApiProperty } from '@nestjs/swagger';
import type { BuFeatureLocks } from '@vritti/api-sdk/catalog-resolver';

// A single (permission, platform) cell. null in the parent ⇒ the feature doesn't ship on that platform.
export class BuMatrixCellDto {
  @ApiProperty({ description: "The org's plan unlocks this (feature, platform, permission)" })
  inPlan: boolean;

  @ApiProperty({ description: 'The BU currently has it enabled (never true when inPlan is false)' })
  selected: boolean;

  @ApiProperty({ type: [String], description: 'Other plan names that unlock it — upsell; only when inPlan is false' })
  availableIn: string[];
}

export class BuMatrixPermissionDto {
  @ApiProperty({ example: 'VIEW' })
  code: string;

  @ApiProperty({ example: 'View' })
  label: string;

  @ApiProperty({ type: BuMatrixCellDto, nullable: true })
  web: BuMatrixCellDto | null;

  @ApiProperty({ type: BuMatrixCellDto, nullable: true })
  mobile: BuMatrixCellDto | null;
}

export class BuMatrixFeatureDto {
  @ApiProperty({ example: 'pos' })
  code: string;

  @ApiProperty({ example: 'POS Terminals' })
  name: string;

  @ApiProperty({ nullable: true, example: 'monitor' })
  icon: string | null;

  @ApiProperty({ type: [String], example: ['web', 'mobile'], description: 'Platforms the feature ships on' })
  platforms: string[];

  @ApiProperty({ description: 'Feature-level: is this feature a member of the org plan at all?' })
  inPlan: boolean;

  @ApiProperty({ type: [String], description: 'Plans that include the feature — upsell when inPlan is false' })
  availableIn: string[];

  @ApiProperty({ type: [BuMatrixPermissionDto] })
  permissions: BuMatrixPermissionDto[];
}

export class BuMatrixAppDto {
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

  @ApiProperty({ type: [BuMatrixFeatureDto] })
  features: BuMatrixFeatureDto[];
}

export class BuMatrixPlanDto {
  @ApiProperty({ example: 'essential' })
  code: string;

  @ApiProperty({ example: 'Essential' })
  name: string;
}

export class BuMatrixResponseDto {
  @ApiProperty({ type: BuMatrixPlanDto })
  plan: BuMatrixPlanDto;

  @ApiProperty({ type: [BuMatrixAppDto] })
  apps: BuMatrixAppDto[];

  @ApiProperty({
    type: Object,
    description: 'The stored BU deny-list — featureCode → { web?/mobile?: null (platform locked) | locked codes }',
  })
  locks: BuFeatureLocks;
}
