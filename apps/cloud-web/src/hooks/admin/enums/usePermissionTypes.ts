import { useQuery } from '@tanstack/react-query';
import { getPermissionTypes } from '../../../services/admin/enums.service';

export const PERMISSION_TYPES_KEY = ['admin', 'enums', 'permission-types'] as const;

// Fetches permission types from the backend — cached indefinitely (enum doesn't change at runtime)
export function usePermissionTypes() {
  return useQuery({
    queryKey: PERMISSION_TYPES_KEY,
    queryFn: getPermissionTypes,
    staleTime: Number.POSITIVE_INFINITY,
  });
}
