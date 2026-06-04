import { useSuspenseQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { Region } from '@/schemas/admin/regions';
import { getRegion } from '../../../services/admin/regions.service';

// Fetches a single region by ID — suspends until data is ready
export function useRegion(id: string) {
  return useSuspenseQuery<Region, AxiosError>({
    queryKey: ['admin', 'regions', id],
    queryFn: () => getRegion(id),
  });
}
