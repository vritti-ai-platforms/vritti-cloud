import type { CreateResponse, SuccessResponse } from '@vritti/quantum-ui/api-response';
import { axios } from '@vritti/quantum-ui/axios';
import type {
  Microfrontend,
  MicrofrontendData,
  MicrofrontendPlatformParam,
  MicrofrontendsTableResponse,
} from '@/schemas/admin/microfrontends';

// Fetches microfrontends for the data table — scoped to a version
export function getMicrofrontendsTable(versionId: string): Promise<MicrofrontendsTableResponse> {
  return axios
    .get<MicrofrontendsTableResponse>(`admin-api/versions/${versionId}/microfrontends/table`)
    .then((r) => r.data);
}

// Upserts a microfrontend under a version — keyed by (versionId, code) on the platform-specific table
export function upsertMicrofrontend({
  versionId,
  platform,
  data,
}: {
  versionId: string;
  platform: MicrofrontendPlatformParam;
  data: MicrofrontendData;
}): Promise<CreateResponse<Microfrontend>> {
  return axios
    .put<CreateResponse<Microfrontend>>(`admin-api/versions/${versionId}/microfrontends/${platform}`, data)
    .then((r) => r.data);
}

// Deletes a microfrontend by platform + ID
export function deleteMicrofrontend({
  versionId,
  platform,
  id,
}: {
  versionId: string;
  platform: MicrofrontendPlatformParam;
  id: string;
}): Promise<SuccessResponse> {
  return axios
    .delete<SuccessResponse>(`admin-api/versions/${versionId}/microfrontends/${platform}/${id}`)
    .then((r) => r.data);
}
