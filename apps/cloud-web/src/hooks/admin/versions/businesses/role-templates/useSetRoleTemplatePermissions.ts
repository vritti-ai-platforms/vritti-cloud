import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import type { AxiosError } from 'axios';
import type { SetPermissionsData } from '@/schemas/admin/role-templates';
import { setRoleTemplatePermissions } from '@/services/admin/versions/businesses/role-templates.service';
import { roleTemplateQueryKey } from './useRoleTemplate';
import { roleTemplatePermissionsPrefixKey } from './useRoleTemplatePermissions';
import { ROLE_TEMPLATES_QUERY_KEY } from './useRoleTemplates';

// Replaces a role template's grants and refreshes its detail + tables. Ids are closed over, so callers submit
// just the grant set ({ grants }).
export function useSetRoleTemplatePermissions(versionId: string, businessId: string, roleId: string) {
  const queryClient = useQueryClient();
  return useMutation<SuccessResponse, AxiosError, SetPermissionsData>({
    mutationFn: (data) => setRoleTemplatePermissions({ versionId, businessId, roleId, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleTemplatePermissionsPrefixKey(versionId, roleId) });
      queryClient.invalidateQueries({ queryKey: roleTemplateQueryKey(versionId, businessId, roleId) });
      queryClient.invalidateQueries({ queryKey: ROLE_TEMPLATES_QUERY_KEY(versionId, businessId) });
    },
  });
}
