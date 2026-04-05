import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateResponse } from '@vritti/quantum-ui/api-response';
import type { AxiosError } from 'axios';
import type { CreateIndustryData, Industry } from '@/schemas/admin/industries';
import { createIndustry } from '../../../services/admin/industries.service';
import { INDUSTRIES_QUERY_KEY } from './useIndustries';

type UseCreateIndustryOptions = Omit<
  UseMutationOptions<CreateResponse<Industry>, AxiosError, CreateIndustryData>,
  'mutationFn'
>;

// Creates a new industry and invalidates the industries list
export function useCreateIndustry(options?: UseCreateIndustryOptions) {
  const queryClient = useQueryClient();
  return useMutation<CreateResponse<Industry>, AxiosError, CreateIndustryData>({
    ...options,
    mutationFn: createIndustry,
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({ queryKey: INDUSTRIES_QUERY_KEY });
      options?.onSuccess?.(result, ...args);
    },
  });
}
