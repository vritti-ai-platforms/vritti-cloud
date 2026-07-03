// Re-exports the shared catalog resolver from api-sdk — the single implementation used by cloud and core

export type {
  BuFeatureLocks,
  CatalogPermission,
  LockReason,
  RoleItem,
} from '@vritti/api-sdk/catalog-resolver';
export { buildBuCatalog, buildBuRoles, isBuLockedOnPlatform, isPlanMember } from '@vritti/api-sdk/catalog-resolver';
