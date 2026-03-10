import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { deleteRegion } from '../../../services/admin/regions.service';
import { REGIONS_QUERY_KEY } from './useRegions';

type UseDeleteRegionOptions = Omit<UseMutationOptions<void, AxiosError, string>, 'mutationFn'>;

// Deletes a region and invalidates the regions list
export function useDeleteRegion(options?: UseDeleteRegionOptions) {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError, string>({
    ...options,
    mutationFn: deleteRegion,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: REGIONS_QUERY_KEY });
      options?.onSuccess?.(...args);
    },
  });
}
