import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import { runBackup } from '@/services/admin/deployments.service';

type RunBackupVars = { id: string; type: string };
type UseRunBackupOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, RunBackupVars>, 'mutationFn'>;

// Triggers an on-demand database backup on the connected agent. The fresh inventory arrives live over SSE.
export function useRunBackup(options?: UseRunBackupOptions) {
  return useMutation<SuccessResponse, AxiosError, RunBackupVars>({
    ...options,
    mutationFn: runBackup,
  });
}
