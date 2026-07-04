import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { CreateResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import type { DeploymentSigningKey } from '@/schemas/admin/deployments';
import { regenerateSigningKey } from '@/services/admin/deployments.service';

type UseRegenerateSigningKeyOptions = Omit<
  UseMutationOptions<CreateResponse<DeploymentSigningKey>, AxiosError, string>,
  'mutationFn'
>;

// Regenerates a deployment's signing keypair and returns the new public key
export function useRegenerateSigningKey(options?: UseRegenerateSigningKeyOptions) {
  return useMutation<CreateResponse<DeploymentSigningKey>, AxiosError, string>({
    ...options,
    mutationFn: regenerateSigningKey,
  });
}
