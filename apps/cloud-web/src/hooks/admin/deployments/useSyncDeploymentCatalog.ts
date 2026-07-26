import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import { toast } from '@vritti/quantum-ui/Sonner';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import { syncDeploymentCatalog } from '@/services/admin/deployments.service';

type UseSyncDeploymentCatalogOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, string>, 'mutationFn'>;

// Re-pushes the signed feature/permission catalog snapshot to a deployment's core
export function useSyncDeploymentCatalog(options?: UseSyncDeploymentCatalogOptions) {
  return useMutation<SuccessResponse, AxiosError, string>({
    ...options,
    mutationFn: syncDeploymentCatalog,
    onSuccess: (...args) => {
      toast.success('Catalog synced to core.');
      options?.onSuccess?.(...args);
    },
  });
}
