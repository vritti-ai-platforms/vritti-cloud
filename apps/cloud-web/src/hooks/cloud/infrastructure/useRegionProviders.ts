import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { ProviderOption } from '@/services/cloud/infrastructure.service';
import { getRegionProviders } from '@/services/cloud/infrastructure.service';

// Fetches cloud providers available in a region
export function useRegionProviders(
  regionId: string,
  options?: Omit<UseQueryOptions<ProviderOption[], AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<ProviderOption[], AxiosError>({
    queryKey: ['cloud', 'regions', regionId, 'providers'],
    queryFn: () => getRegionProviders(regionId),
    enabled: !!regionId,
    ...options,
  });
}
