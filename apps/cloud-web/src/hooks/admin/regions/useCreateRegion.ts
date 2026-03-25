import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { CreateResponse } from '@vritti/quantum-ui/api-response';
import type { CreateRegionData, Region } from '@/schemas/admin/regions';
import { createRegion } from '../../../services/admin/regions.service';
import { REGIONS_QUERY_KEY } from './useRegions';

type UseCreateRegionOptions = Omit<
  UseMutationOptions<CreateResponse<Region>, AxiosError, CreateRegionData>,
  'mutationFn'
>;

// Creates a new region and invalidates the regions list
export function useCreateRegion(options?: UseCreateRegionOptions) {
  const queryClient = useQueryClient();
  return useMutation<CreateResponse<Region>, AxiosError, CreateRegionData>({
    ...options,
    mutationFn: createRegion,
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({ queryKey: REGIONS_QUERY_KEY });
      options?.onSuccess?.(result, ...args);
    },
  });
}
