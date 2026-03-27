import { useSuspenseQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { Version } from '@/schemas/admin/versions';
import { getVersion } from '../../../services/admin/versions.service';

export function versionQueryKey(id: string) {
  return ['admin', 'versions', id] as const;
}

// Fetches a single version by ID — suspends until data is ready
export function useVersion(id: string) {
  return useSuspenseQuery<Version, AxiosError>({
    queryKey: versionQueryKey(id),
    queryFn: () => getVersion(id),
  });
}
