import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import { restoreDatabase } from '@/services/admin/deployments.service';

type RestoreDatabaseVars = { id: string; targetTime?: string; setLabel?: string };
type UseRestoreDatabaseOptions = Omit<
  UseMutationOptions<SuccessResponse, AxiosError, RestoreDatabaseVars>,
  'mutationFn'
>;

// Triggers a destructive database restore on the connected agent. Progress + the recovered stack arrive live
// over SSE — no query invalidation needed.
export function useRestoreDatabase(options?: UseRestoreDatabaseOptions) {
  return useMutation<SuccessResponse, AxiosError, RestoreDatabaseVars>({
    ...options,
    mutationFn: restoreDatabase,
  });
}
