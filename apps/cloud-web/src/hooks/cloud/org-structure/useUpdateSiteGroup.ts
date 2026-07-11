import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import type { UpdateSiteGroupData } from '@/schemas/cloud/org-structure';
import { updateSiteGroup } from '@/services/cloud/org-structure.service';
import { ORG_STRUCTURE_QUERY_KEY } from './useOrgStructure';

type UpdateSiteGroupVars = { orgId: string; groupId: string; data: UpdateSiteGroupData };
type UseUpdateSiteGroupOptions = Omit<
  UseMutationOptions<SuccessResponse, AxiosError, UpdateSiteGroupVars>,
  'mutationFn'
>;

// Updates a site group and invalidates the org structure
export function useUpdateSiteGroup(options?: UseUpdateSiteGroupOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, UpdateSiteGroupVars>({
    ...options,
    mutationFn: updateSiteGroup,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: ORG_STRUCTURE_QUERY_KEY(vars.orgId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
