import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { CreateResponse } from '@vritti/quantum-ui/api-response';
import type { CreateMicrofrontendData, Microfrontend } from '@/schemas/admin/microfrontends';
import { createMicrofrontend } from '../../../services/admin/microfrontends.service';
import { microfrontendsTableKey } from './useMicrofrontendsTable';

type CreateMicrofrontendVars = { versionId: string; data: CreateMicrofrontendData };
type UseCreateMicrofrontendOptions = Omit<
  UseMutationOptions<CreateResponse<Microfrontend>, AxiosError, CreateMicrofrontendVars>,
  'mutationFn'
>;

// Creates a new microfrontend and invalidates the table
export function useCreateMicrofrontend(versionId: string, options?: UseCreateMicrofrontendOptions) {
  const queryClient = useQueryClient();
  return useMutation<CreateResponse<Microfrontend>, AxiosError, CreateMicrofrontendVars>({
    ...options,
    mutationFn: createMicrofrontend,
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({ queryKey: microfrontendsTableKey(versionId) });
      options?.onSuccess?.(result, ...args);
    },
  });
}
