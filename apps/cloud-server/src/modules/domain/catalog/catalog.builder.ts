// Re-exports the shared catalog resolver from api-sdk — the single implementation used by cloud and core

export type {
  CatalogPermission,
  LockReason,
  SiteFeatureLocks,
} from '@vritti/api-sdk/catalog-resolver';
export { buildSiteCatalog, isPlanMember, isSiteLockedOnPlatform } from '@vritti/api-sdk/catalog-resolver';
