import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { Region } from '@/schemas/admin/regions';
import { getRegion } from '../../../services/admin/regions.service';

// Fetches a single region by ID
export function useRegion(id: string, options?: Omit<UseQueryOptions<Region, AxiosError>, 'queryKey' | 'queryFn'>) {
  return useQuery<Region, AxiosError>({
    queryKey: ['admin', 'regions', id],
    queryFn: () => getRegion(id),
    ...options,
  });
}
