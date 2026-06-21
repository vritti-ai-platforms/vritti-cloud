import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateResponse, SuccessResponse } from '@vritti/quantum-ui/api-response';
import type { AxiosError } from 'axios';
import type { FeaturePermission } from '@/schemas/admin/feature-permissions';
import {
  bulkCreatePermissions,
  createPermission,
  deletePermission,
  updatePermission,
} from '@/services/admin/versions/features/permissions.service';

type CreateVars = Parameters<typeof createPermission>[0];
type BulkCreateVars = Parameters<typeof bulkCreatePermissions>[0];
type UpdateVars = Parameters<typeof updatePermission>[0];
type DeleteVars = Parameters<typeof deletePermission>[0];

// Bulk-creates permissions in one request and invalidates the provided permissions table
export function useBulkCreatePermissions(
  invalidateKey: readonly unknown[],
  options?: Omit<UseMutationOptions<SuccessResponse, AxiosError, BulkCreateVars>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, BulkCreateVars>({
    ...options,
    mutationFn: bulkCreatePermissions,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: invalidateKey });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}

// Creates a version-level permission and invalidates the provided permissions table
export function useCreatePermission(
  invalidateKey: readonly unknown[],
  options?: Omit<UseMutationOptions<CreateResponse<FeaturePermission>, AxiosError, CreateVars>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  return useMutation<CreateResponse<FeaturePermission>, AxiosError, CreateVars>({
    ...options,
    mutationFn: createPermission,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: invalidateKey });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}

// Updates a version-level permission and invalidates the provided permissions table
export function useUpdatePermission(
  invalidateKey: readonly unknown[],
  options?: Omit<UseMutationOptions<SuccessResponse, AxiosError, UpdateVars>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, UpdateVars>({
    ...options,
    mutationFn: updatePermission,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: invalidateKey });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}

// Deletes a version-level permission and invalidates the provided permissions table
export function useDeletePermission(
  invalidateKey: readonly unknown[],
  options?: Omit<UseMutationOptions<SuccessResponse, AxiosError, DeleteVars>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, DeleteVars>({
    ...options,
    mutationFn: deletePermission,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: invalidateKey });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
