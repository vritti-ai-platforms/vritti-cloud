import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateResponse } from '@vritti/quantum-ui/api-response';
import type { AxiosError } from 'axios';
import type { CreateMarketData, Market } from '@/schemas/admin/markets';
import { createMarket } from '@/services/admin/markets.service';
import { MARKETS_QUERY_KEY } from './useMarkets';

type UseCreateMarketOptions = Omit<
  UseMutationOptions<CreateResponse<Market>, AxiosError, CreateMarketData>,
  'mutationFn'
>;

export function useCreateMarket(options?: UseCreateMarketOptions) {
  const queryClient = useQueryClient();
  return useMutation<CreateResponse<Market>, AxiosError, CreateMarketData>({
    ...options,
    mutationFn: createMarket,
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({ queryKey: MARKETS_QUERY_KEY });
      options?.onSuccess?.(result, ...args);
    },
  });
}
