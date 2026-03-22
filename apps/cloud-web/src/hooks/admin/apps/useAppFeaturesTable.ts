import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { AppFeaturesTableResponse } from '@/schemas/admin/apps';
import { getAppFeaturesTable } from '../../../services/admin/apps.service';

export const APP_FEATURES_TABLE_KEY = (versionId: string, appId: string) => ['admin', 'versions', versionId, 'apps', appId, 'features', 'table'] as const;

// Fetches app features for the data table — server applies filter/sort state
export function useAppFeaturesTable(
  versionId: string,
  appId: string,
  options?: Omit<UseQueryOptions<AppFeaturesTableResponse, AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<AppFeaturesTableResponse, AxiosError>({
    queryKey: APP_FEATURES_TABLE_KEY(versionId, appId),
    queryFn: () => getAppFeaturesTable(versionId, appId),
    enabled: !!appId,
    ...options,
  });
}
