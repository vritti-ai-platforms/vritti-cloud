import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { AppPrice } from '@/schemas/admin/apps';
import { getAppPrices } from '../../../services/admin/apps.service';

export const APP_PRICES_QUERY_KEY = (versionId: string, appId: string) => ['admin', 'versions', versionId, 'apps', appId, 'prices'] as const;

// Fetches prices for an app
export function useAppPrices(
  versionId: string,
  appId: string,
  options?: Omit<UseQueryOptions<AppPrice[], AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<AppPrice[], AxiosError>({
    queryKey: APP_PRICES_QUERY_KEY(versionId, appId),
    queryFn: () => getAppPrices(versionId, appId),
    enabled: !!appId,
    ...options,
  });
}
