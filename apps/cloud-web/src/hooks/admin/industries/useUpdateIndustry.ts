import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { UpdateIndustryData } from '@/schemas/admin/industries';
import { updateIndustry } from '../../../services/admin/industries.service';
import { INDUSTRIES_QUERY_KEY } from './useIndustries';

type UseUpdateIndustryOptions = Omit<
  UseMutationOptions<{ success: boolean; message: string }, AxiosError, { id: string; data: UpdateIndustryData }>,
  'mutationFn'
>;

// Updates an industry and invalidates the industries list
export function useUpdateIndustry(options?: UseUpdateIndustryOptions) {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean; message: string }, AxiosError, { id: string; data: UpdateIndustryData }>({
    ...options,
    mutationFn: updateIndustry,
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({ queryKey: INDUSTRIES_QUERY_KEY });
      options?.onSuccess?.(result, ...args);
    },
  });
}
