import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { CountriesTableResponse } from '@/schemas/admin/countries';
import { getCountries } from '@/services/admin/countries.service';

export const COUNTRIES_QUERY_KEY = ['admin', 'countries'] as const;

// Fetches all countries
export function useCountries(
  options?: Omit<UseQueryOptions<CountriesTableResponse, AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<CountriesTableResponse, AxiosError>({
    queryKey: COUNTRIES_QUERY_KEY,
    queryFn: getCountries,
    ...options,
  });
}
