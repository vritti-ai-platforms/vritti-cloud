import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { CreateRegionData } from '@/schemas/admin/regions';
import { createRegion } from '../../../services/admin/regions.service';
import { REGIONS_QUERY_KEY } from './useRegions';

type UseCreateRegionOptions = Omit<
  UseMutationOptions<{ success: boolean; message: string }, AxiosError, CreateRegionData>,
  'mutationFn'
>;

// Creates a new region and invalidates the regions list
export function useCreateRegion(options?: UseCreateRegionOptions) {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean; message: string }, AxiosError, CreateRegionData>({
    ...options,
    mutationFn: createRegion,
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({ queryKey: REGIONS_QUERY_KEY });
      options?.onSuccess?.(result, ...args);
    },
  });
}
