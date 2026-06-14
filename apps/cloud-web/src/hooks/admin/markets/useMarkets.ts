import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { MarketsTableResponse } from '@/schemas/admin/markets';
import { getMarkets } from '@/services/admin/markets.service';

export const MARKETS_QUERY_KEY = ['admin', 'markets'] as const;

// Fetches all markets
export function useMarkets(options?: Omit<UseQueryOptions<MarketsTableResponse, AxiosError>, 'queryKey' | 'queryFn'>) {
  return useQuery<MarketsTableResponse, AxiosError>({
    queryKey: MARKETS_QUERY_KEY,
    queryFn: getMarkets,
    ...options,
  });
}
