import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import type { AxiosError } from 'axios';
import { assignMarketCountry } from '@/services/admin/markets.service';
import { marketQueryKey } from './useMarket';
import { marketCountriesQueryKey } from './useMarketCountries';

type Vars = { marketId: string; countryId: string };
type UseAssignMarketCountryOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, Vars>, 'mutationFn'>;

export function useAssignMarketCountry(options?: UseAssignMarketCountryOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, Vars>({
    ...options,
    mutationFn: assignMarketCountry,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: marketCountriesQueryKey(vars.marketId) });
      queryClient.invalidateQueries({ queryKey: marketQueryKey(vars.marketId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
