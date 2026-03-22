import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import type { UpdateOrgRoleData } from '@/schemas/cloud/org-roles';
import { updateOrgRole } from '../../../services/cloud/org-roles.service';
import { ORG_ROLES_QUERY_KEY } from './useOrgRoles';

type UpdateOrgRoleVars = { orgId: string; roleId: string; data: UpdateOrgRoleData };
type UseUpdateOrgRoleOptions = Omit<UseMutationOptions<SuccessResponse, AxiosError, UpdateOrgRoleVars>, 'mutationFn'>;

// Updates a role in the organization and invalidates the roles list
export function useUpdateOrgRole(options?: UseUpdateOrgRoleOptions) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, UpdateOrgRoleVars>({
    ...options,
    mutationFn: updateOrgRole,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: ORG_ROLES_QUERY_KEY(vars.orgId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
