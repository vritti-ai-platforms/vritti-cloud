import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { Region, UpdateRegionData } from '@/schemas/admin/regions';
import { updateRegion } from '../../../services/admin/regions.service';
import { REGIONS_QUERY_KEY } from './useRegions';

interface UpdateRegionVariables {
  id: string;
  data: UpdateRegionData;
}

type UseUpdateRegionOptions = Omit<UseMutationOptions<Region, AxiosError, UpdateRegionVariables>, 'mutationFn'>;

// Updates a region and invalidates the region detail and list queries
export function useUpdateRegion(options?: UseUpdateRegionOptions) {
  const queryClient = useQueryClient();
  return useMutation<Region, AxiosError, UpdateRegionVariables>({
    mutationFn: ({ id, data }) => updateRegion(id, data),
    ...options,
    onSuccess: (updatedRegion, variables, ...args) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'regions', variables.id] });
      queryClient.invalidateQueries({ queryKey: REGIONS_QUERY_KEY });
      options?.onSuccess?.(updatedRegion, variables, ...args);
    },
  });
}
