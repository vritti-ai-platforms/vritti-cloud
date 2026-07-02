// Re-exports the shared catalog resolver from api-sdk — the single implementation used by cloud and core

export type {
  BuFeatureUnlocks,
  CatalogPermission,
  FeatureCatalogEntry,
  LockReason,
  RoleItem,
} from '@vritti/api-sdk/catalog-resolver';
export { buildBuCatalog, buildBuRoles, isPlanMember, unlockedCodes } from '@vritti/api-sdk/catalog-resolver';
