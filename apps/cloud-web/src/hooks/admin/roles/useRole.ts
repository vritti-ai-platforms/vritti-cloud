import { useSuspenseQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { RoleDetail } from '@/schemas/admin/roles';
import { getRole } from '../../../services/admin/roles.service';

export function roleQueryKey(versionId: string, id: string) {
  return ['admin', 'versions', versionId, 'roles', id] as const;
}

// Fetches a single role with permissions — suspends until data is ready
export function useRole(versionId: string, id: string) {
  return useSuspenseQuery<RoleDetail, AxiosError>({
    queryKey: roleQueryKey(versionId, id),
    queryFn: () => getRole(versionId, id),
  });
}
