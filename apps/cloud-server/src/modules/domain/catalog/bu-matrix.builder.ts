// Re-exports the shared BU matrix builder from api-sdk — the single implementation used by cloud and core

export type {
  BuMatrix,
  BuMatrixApp,
  BuMatrixCell,
  BuMatrixFeature,
  BuMatrixPermission,
} from '@vritti/api-sdk/catalog-resolver';
export { buildBuMatrix } from '@vritti/api-sdk/catalog-resolver';
