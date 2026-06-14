import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { unassignMarketCountry } from '@/services/admin/markets.service';
import { marketQueryKey } from './useMarket';
import { marketCountriesQueryKey } from './useMarketCountries';

type Vars = { marketId: string; countryId: string };
type UseUnassignMarketCountryOptions = Omit<UseMutationOptions<void, AxiosError, Vars>, 'mutationFn'>;

export function useUnassignMarketCountry(options?: UseUnassignMarketCountryOptions) {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError, Vars>({
    ...options,
    mutationFn: unassignMarketCountry,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: marketCountriesQueryKey(vars.marketId) });
      queryClient.invalidateQueries({ queryKey: marketQueryKey(vars.marketId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
