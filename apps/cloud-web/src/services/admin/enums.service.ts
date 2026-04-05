import { axios } from '@vritti/quantum-ui/axios';

// Fetches all available permission types from the backend enum
export function getPermissionTypes(): Promise<{ values: string[] }> {
  return axios.get<{ values: string[] }>('admin-api/enums/permission-types').then((r) => r.data);
}
