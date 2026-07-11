import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateResponse } from '@vritti/quantum-ui/types/api-response';
import type { AxiosError } from 'axios';
import type { CreateSiteGroupData, SiteGroup } from '@/schemas/cloud/org-structure';
import { createSiteGroup } from '@/services/cloud/org-structure.service';
import { ORG_STRUCTURE_QUERY_KEY } from './useOrgStructure';

type CreateSiteGroupVars = { orgId: string; data: CreateSiteGroupData };
type UseCreateSiteGroupOptions = Omit<
  UseMutationOptions<CreateResponse<SiteGroup>, AxiosError, CreateSiteGroupVars>,
  'mutationFn'
>;

// Creates a site group and invalidates the org structure
export function useCreateSiteGroup(options?: UseCreateSiteGroupOptions) {
  const queryClient = useQueryClient();
  return useMutation<CreateResponse<SiteGroup>, AxiosError, CreateSiteGroupVars>({
    ...options,
    mutationFn: createSiteGroup,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: ORG_STRUCTURE_QUERY_KEY(vars.orgId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
