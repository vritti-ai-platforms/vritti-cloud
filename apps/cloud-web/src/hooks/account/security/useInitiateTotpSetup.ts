import type { TotpSetupData } from '@services/account/security.service';
import { initiateTotpSetup } from '@services/account/security.service';
import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

export function useInitiateTotpSetup(
  options?: Omit<UseMutationOptions<TotpSetupData, AxiosError, void>, 'mutationFn'>,
) {
  return useMutation<TotpSetupData, AxiosError, void>({
    mutationFn: initiateTotpSetup,
    ...options,
  });
}
