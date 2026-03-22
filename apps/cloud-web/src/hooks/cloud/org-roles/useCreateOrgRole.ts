import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { CreateOrgRoleData, OrgRole } from '@/schemas/cloud/org-roles';
import { createOrgRole } from '../../../services/cloud/org-roles.service';
import { ORG_ROLES_QUERY_KEY } from './useOrgRoles';

type CreateOrgRoleVars = { orgId: string; data: CreateOrgRoleData };
type UseCreateOrgRoleOptions = Omit<UseMutationOptions<OrgRole, AxiosError, CreateOrgRoleVars>, 'mutationFn'>;

// Creates a new role in the organization and invalidates the roles list
export function useCreateOrgRole(options?: UseCreateOrgRoleOptions) {
  const queryClient = useQueryClient();
  return useMutation<OrgRole, AxiosError, CreateOrgRoleVars>({
    ...options,
    mutationFn: createOrgRole,
    onSuccess: (result, vars, ...args) => {
      queryClient.invalidateQueries({ queryKey: ORG_ROLES_QUERY_KEY(vars.orgId) });
      options?.onSuccess?.(result, vars, ...args);
    },
  });
}
