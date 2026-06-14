import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import type { AxiosError } from 'axios';
import type { UpdateMarketData } from '@/schemas/admin/markets';
import { updateMarket } from '@/services/admin/markets.service';
import { marketQueryKey } from './useMarket';
import { MARKETS_QUERY_KEY } from './useMarkets';

type Vars = { id: string; data: UpdateMarketData };
type UseUpdateMarketOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, Vars>, 'mutationFn'>;

export function useUpdateMarket(options?: UseUpdateMarketOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, Vars>({
    ...options,
    mutationFn: updateMarket,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: marketQueryKey(vars.id) });
      queryClient.invalidateQueries({ queryKey: MARKETS_QUERY_KEY });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
