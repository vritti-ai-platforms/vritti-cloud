import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import { deleteSiteGroup } from '@/services/cloud/org-structure.service';
import { ORG_STRUCTURE_QUERY_KEY } from './useOrgStructure';

type DeleteSiteGroupVars = { orgId: string; groupId: string };
type UseDeleteSiteGroupOptions = Omit<
  UseMutationOptions<SuccessResponse, AxiosError, DeleteSiteGroupVars>,
  'mutationFn'
>;

// Deletes a site group and invalidates the org structure
export function useDeleteSiteGroup(options?: UseDeleteSiteGroupOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, DeleteSiteGroupVars>({
    ...options,
    mutationFn: deleteSiteGroup,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: ORG_STRUCTURE_QUERY_KEY(vars.orgId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
