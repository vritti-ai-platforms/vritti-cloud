import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { MarketCountry } from '@/schemas/admin/markets';
import { getMarketCountries } from '@/services/admin/markets.service';

export function marketCountriesQueryKey(marketId: string) {
  return ['admin', 'markets', marketId, 'countries'] as const;
}

// Fetches all countries with their assignment state for a market
export function useMarketCountries(
  marketId: string,
  options?: Omit<UseQueryOptions<MarketCountry[], AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<MarketCountry[], AxiosError>({
    queryKey: marketCountriesQueryKey(marketId),
    queryFn: () => getMarketCountries(marketId),
    enabled: !!marketId,
    ...options,
  });
}
