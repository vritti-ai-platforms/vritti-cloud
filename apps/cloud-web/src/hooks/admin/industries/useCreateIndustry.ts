import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { CreateIndustryData } from '@/schemas/admin/industries';
import { createIndustry } from '../../../services/admin/industries.service';
import { INDUSTRIES_QUERY_KEY } from './useIndustries';

type UseCreateIndustryOptions = Omit<
  UseMutationOptions<{ success: boolean; message: string }, AxiosError, CreateIndustryData>,
  'mutationFn'
>;

// Creates a new industry and invalidates the industries list
export function useCreateIndustry(options?: UseCreateIndustryOptions) {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean; message: string }, AxiosError, CreateIndustryData>({
    ...options,
    mutationFn: createIndustry,
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({ queryKey: INDUSTRIES_QUERY_KEY });
      options?.onSuccess?.(result, ...args);
    },
  });
}
