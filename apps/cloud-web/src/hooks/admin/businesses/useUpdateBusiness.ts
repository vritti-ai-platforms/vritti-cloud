import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { UpdateBusinessData } from '@/schemas/admin/businesses';
import { updateBusiness } from '@/services/admin/businesses.service';
import { BUSINESSES_QUERY_KEY } from './useBusinesses';

type UseUpdateBusinessOptions = Omit<
  UseMutationOptions<{ success: boolean; message: string }, AxiosError, { id: string; data: UpdateBusinessData }>,
  'mutationFn'
>;

// Updates a business and invalidates the businesses list
export function useUpdateBusiness(options?: UseUpdateBusinessOptions) {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean; message: string }, AxiosError, { id: string; data: UpdateBusinessData }>({
    ...options,
    mutationFn: updateBusiness,
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({ queryKey: BUSINESSES_QUERY_KEY });
      options?.onSuccess?.(result, ...args);
    },
  });
}
