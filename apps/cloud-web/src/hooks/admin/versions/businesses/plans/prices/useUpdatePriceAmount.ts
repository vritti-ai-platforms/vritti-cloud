import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import type { UpdatePriceAmountData } from '@/schemas/admin/prices';
import { updatePriceAmount } from '@/services/admin/versions/businesses/plans/prices.service';
import { pricesQueryKey } from './usePrices';

type Vars = { versionId: string; businessId: string; planId: string; priceId: string; data: UpdatePriceAmountData };
type UseUpdatePriceAmountOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, Vars>, 'mutationFn'>;

export function useUpdatePriceAmount(options?: UseUpdatePriceAmountOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, Vars>({
    ...options,
    mutationFn: updatePriceAmount,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: pricesQueryKey(vars.versionId, vars.businessId, vars.planId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
