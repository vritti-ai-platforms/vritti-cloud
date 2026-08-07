import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import { recreateService } from '@/services/admin/deployments.service';

type RecreateServiceVars = { id: string; service: string };
type UseRecreateServiceOptions = Omit<
  UseMutationOptions<SuccessResponse, AxiosError, RecreateServiceVars>,
  'mutationFn'
>;

// Recreates one service's container so it restarts with the latest env from Infisical.
export function useRecreateService(options?: UseRecreateServiceOptions) {
  return useMutation<SuccessResponse, AxiosError, RecreateServiceVars>({
    ...options,
    mutationFn: recreateService,
  });
}
