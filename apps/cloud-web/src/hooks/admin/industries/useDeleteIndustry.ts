import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { deleteIndustry } from '../../../services/admin/industries.service';
import { INDUSTRIES_QUERY_KEY } from './useIndustries';

type UseDeleteIndustryOptions = Omit<UseMutationOptions<void, AxiosError, string>, 'mutationFn'>;

// Deletes an industry and invalidates the industries list
export function useDeleteIndustry(options?: UseDeleteIndustryOptions) {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError, string>({
    ...options,
    mutationFn: deleteIndustry,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: INDUSTRIES_QUERY_KEY });
      options?.onSuccess?.(...args);
    },
  });
}
