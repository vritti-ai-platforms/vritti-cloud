import type { SiteType } from '@vritti/quantum-ui/types/catalog-resolver';

export const SITE_TYPE_VALUES = ['OUTLET', 'WAREHOUSE', 'PRODUCTION'] as const;

export const SITE_TYPE_LABELS: Record<SiteType, string> = {
  OUTLET: 'Outlet',
  WAREHOUSE: 'Warehouse',
  PRODUCTION: 'Production',
};
