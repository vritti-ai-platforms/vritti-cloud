import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import { toast } from '@vritti/quantum-ui/Sonner';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import { forceRecheckAgent } from '@/services/admin/deployments.service';

type UseForceRecheckAgentOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, string>, 'mutationFn'>;

// Asks the connected agent to reconcile now (clears its backoff), avoiding the wait on the periodic resync.
export function useForceRecheckAgent(options?: UseForceRecheckAgentOptions) {
  return useMutation<SuccessResponse, AxiosError, string>({
    ...options,
    mutationFn: forceRecheckAgent,
    onSuccess: (...args) => {
      toast.success(args[0].message ?? 'Recheck requested — the agent is reconciling now.');
      options?.onSuccess?.(...args);
    },
  });
}
