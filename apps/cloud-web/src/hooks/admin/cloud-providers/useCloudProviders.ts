import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { type CloudProvidersResponse, getCloudProviders } from '../../../services/admin/cloud-providers.service';

export const CLOUD_PROVIDERS_QUERY_KEY = ['admin', 'cloud-providers'] as const;

// Fetches all cloud providers — server applies filter/sort state from Redis
export function useCloudProviders(
  options?: Omit<UseQueryOptions<CloudProvidersResponse, AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<CloudProvidersResponse, AxiosError>({
    queryKey: CLOUD_PROVIDERS_QUERY_KEY,
    queryFn: getCloudProviders,
    ...options,
  });
}
