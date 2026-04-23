import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { BackupCodesResponse } from '@services/account/security.service';
import { regenerateBackupCodes } from '@services/account/security.service';
import { MFA_STATUS_QUERY_KEY } from './useMfaStatus';

export function useRegenerateBackupCodes(
  options?: Omit<UseMutationOptions<BackupCodesResponse, AxiosError, void>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();

  return useMutation<BackupCodesResponse, AxiosError, void>({
    mutationFn: regenerateBackupCodes,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: MFA_STATUS_QUERY_KEY });
      options?.onSuccess?.(...args);
    },
  });
}
