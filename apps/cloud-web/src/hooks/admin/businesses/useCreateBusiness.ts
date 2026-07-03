import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import type { Business, CreateBusinessData } from '@/schemas/admin/businesses';
import { createBusiness } from '@/services/admin/businesses.service';
import { BUSINESSES_QUERY_KEY } from './useBusinesses';

type UseCreateBusinessOptions = Omit<
  UseMutationOptions<CreateResponse<Business>, AxiosError, CreateBusinessData>,
  'mutationFn'
>;

// Creates a new business and invalidates the businesses list
export function useCreateBusiness(options?: UseCreateBusinessOptions) {
  const queryClient = useQueryClient();
  return useMutation<CreateResponse<Business>, AxiosError, CreateBusinessData>({
    ...options,
    mutationFn: createBusiness,
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({ queryKey: BUSINESSES_QUERY_KEY });
      options?.onSuccess?.(result, ...args);
    },
  });
}
