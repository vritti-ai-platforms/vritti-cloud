import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { ValidateImportResponse } from '@/schemas/admin/import';
import { validateAppImport } from '@/services/admin/apps.service';

type Options = Omit<UseMutationOptions<ValidateImportResponse, AxiosError, File>, 'mutationFn'>;

// Validates a CSV/Excel file of apps and returns parsed rows with errors
export function useValidateAppImport(versionId: string, options?: Options) {
  return useMutation<ValidateImportResponse, AxiosError, File>({
    ...options,
    mutationFn: (file) => validateAppImport(versionId, file),
  });
}
