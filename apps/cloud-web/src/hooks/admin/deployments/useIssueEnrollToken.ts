import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { CreateResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import type { EnrollToken } from '@/schemas/admin/deployments';
import { issueEnrollToken } from '@/services/admin/deployments.service';

type UseIssueEnrollTokenOptions = Omit<
  UseMutationOptions<CreateResponse<EnrollToken>, AxiosError, string>,
  'mutationFn'
>;

// Issues a one-time agent enroll token for a deployment (shown once)
export function useIssueEnrollToken(options?: UseIssueEnrollTokenOptions) {
  return useMutation<CreateResponse<EnrollToken>, AxiosError, string>({
    ...options,
    mutationFn: issueEnrollToken,
  });
}
