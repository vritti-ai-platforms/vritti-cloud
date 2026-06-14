import { useQuery } from '@tanstack/react-query';
import type { VersionBusinessesTableResponse } from '@/schemas/admin/version-businesses';
import { getVersionBusinessesTable } from '../../../services/admin/version-businesses.service';

export const VERSION_BUSINESSES_TABLE_KEY = (versionId: string) =>
  ['admin', 'versions', versionId, 'businesses', 'table'] as const;

// Fetches the businesses-in-version data table (server-stored filter/sort/pagination state)
export function useVersionBusinessesTable(versionId: string) {
  return useQuery<VersionBusinessesTableResponse>({
    queryKey: VERSION_BUSINESSES_TABLE_KEY(versionId),
    queryFn: () => getVersionBusinessesTable(versionId),
  });
}
