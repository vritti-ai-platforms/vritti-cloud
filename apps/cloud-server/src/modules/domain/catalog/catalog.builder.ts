// Re-exports the shared catalog resolver from api-sdk — the single implementation used by cloud and core

export type {
  CatalogPermission,
  LockReason,
  RoleItem,
  SiteFeatureLocks,
} from '@vritti/api-sdk/catalog-resolver';
export {
  buildSiteCatalog,
  buildSiteRoles,
  isPlanMember,
  isSiteLockedOnPlatform,
} from '@vritti/api-sdk/catalog-resolver';
