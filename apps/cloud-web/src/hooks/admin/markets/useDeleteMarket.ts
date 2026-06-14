import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { deleteMarket } from '@/services/admin/markets.service';
import { MARKETS_QUERY_KEY } from './useMarkets';

type UseDeleteMarketOptions = Omit<UseMutationOptions<void, AxiosError, string>, 'mutationFn'>;

export function useDeleteMarket(options?: UseDeleteMarketOptions) {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError, string>({
    ...options,
    mutationFn: deleteMarket,
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({ queryKey: MARKETS_QUERY_KEY });
      options?.onSuccess?.(result, ...args);
    },
  });
}
