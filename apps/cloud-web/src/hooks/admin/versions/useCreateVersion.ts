import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateResponse } from '@vritti/quantum-ui/api-response';
import type { AxiosError } from 'axios';
import type { CreateVersionData, Version } from '@/schemas/admin/versions';
import { createVersion } from '../../../services/admin/versions.service';
import { VERSIONS_TABLE_KEY } from './useVersionsTable';

type UseCreateVersionOptions = Omit<
  UseMutationOptions<CreateResponse<Version>, AxiosError, CreateVersionData>,
  'mutationFn'
>;

// Creates a new version and invalidates the versions list
export function useCreateVersion(options?: UseCreateVersionOptions) {
  const queryClient = useQueryClient();
  return useMutation<CreateResponse<Version>, AxiosError, CreateVersionData>({
    ...options,
    mutationFn: createVersion,
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({ queryKey: VERSIONS_TABLE_KEY });
      options?.onSuccess?.(result, ...args);
    },
  });
}
