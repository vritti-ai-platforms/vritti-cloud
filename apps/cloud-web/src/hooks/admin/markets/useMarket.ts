import { useSuspenseQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { Market } from '@/schemas/admin/markets';
import { getMarket } from '@/services/admin/markets.service';

export function marketQueryKey(id: string) {
  return ['admin', 'markets', id] as const;
}

// Fetches a single market by ID — suspends until data is ready
export function useMarket(id: string) {
  return useSuspenseQuery<Market, AxiosError>({
    queryKey: marketQueryKey(id),
    queryFn: () => getMarket(id),
  });
}
