import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { ValidateImportResponse } from '@/schemas/admin/import';
import { validateFeatureImport } from '@/services/admin/features.service';

type Options = Omit<UseMutationOptions<ValidateImportResponse, AxiosError, File>, 'mutationFn'>;

// Validates a CSV/Excel file of features and returns parsed rows with errors
export function useValidateFeatureImport(versionId: string, options?: Options) {
  return useMutation<ValidateImportResponse, AxiosError, File>({
    ...options,
    mutationFn: (file) => validateFeatureImport(versionId, file),
  });
}
