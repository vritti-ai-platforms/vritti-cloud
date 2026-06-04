import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { deleteBusiness } from '../../../services/admin/businesses.service';
import { BUSINESSES_QUERY_KEY } from './useBusinesses';

type UseDeleteBusinessOptions = Omit<UseMutationOptions<void, AxiosError, string>, 'mutationFn'>;

// Deletes a business and invalidates the businesses list
export function useDeleteBusiness(options?: UseDeleteBusinessOptions) {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError, string>({
    ...options,
    mutationFn: deleteBusiness,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: BUSINESSES_QUERY_KEY });
      options?.onSuccess?.(...args);
    },
  });
}
