import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { AppVersion } from '@/schemas/admin/app-versions';
import { getAppVersion } from '../../../services/admin/app-versions.service';

export function appVersionQueryKey(id: string) {
  return ['admin', 'app-versions', id] as const;
}

// Fetches a single app version by ID
export function useAppVersion(
  id: string,
  options?: Omit<UseQueryOptions<AppVersion, AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<AppVersion, AxiosError>({
    queryKey: appVersionQueryKey(id),
    queryFn: () => getAppVersion(id),
    enabled: !!id,
    ...options,
  });
}
