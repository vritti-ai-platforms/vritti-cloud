import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { RequestChangeResponse } from '@services/verification.service';
import { requestPhoneChange } from '@services/verification.service';

type UseRequestPhoneChangeOptions = Omit<
  UseMutationOptions<RequestChangeResponse, AxiosError, { newPhone: string; newPhoneCountry: string }>,
  'mutationFn'
>;

// Submits a new phone number for change
export function useRequestPhoneChange(options?: UseRequestPhoneChangeOptions) {
  return useMutation<RequestChangeResponse, AxiosError, { newPhone: string; newPhoneCountry: string }>({
    mutationFn: requestPhoneChange,
    ...options,
  });
}
