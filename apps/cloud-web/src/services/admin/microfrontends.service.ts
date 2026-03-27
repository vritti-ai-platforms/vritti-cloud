import type { CreateResponse, SuccessResponse } from '@vritti/quantum-ui/api-response';
import { axios } from '@vritti/quantum-ui/axios';
import type {
  CreateMicrofrontendData,
  Microfrontend,
  MicrofrontendsTableResponse,
  UpdateMicrofrontendData,
} from '@/schemas/admin/microfrontends';

// Fetches microfrontends for the data table — scoped to a version
export function getMicrofrontendsTable(versionId: string): Promise<MicrofrontendsTableResponse> {
  return axios
    .get<MicrofrontendsTableResponse>(`admin-api/versions/${versionId}/microfrontends/table`)
    .then((r) => r.data);
}

// Creates a new microfrontend under a version
export function createMicrofrontend({
  versionId,
  data,
}: {
  versionId: string;
  data: CreateMicrofrontendData;
}): Promise<CreateResponse<Microfrontend>> {
  return axios
    .post<CreateResponse<Microfrontend>>(`admin-api/versions/${versionId}/microfrontends`, data)
    .then((r) => r.data);
}

// Updates a microfrontend by ID
export function updateMicrofrontend({
  versionId,
  id,
  data,
}: {
  versionId: string;
  id: string;
  data: UpdateMicrofrontendData;
}): Promise<SuccessResponse> {
  return axios
    .patch<SuccessResponse>(`admin-api/versions/${versionId}/microfrontends/${id}`, data)
    .then((r) => r.data);
}

// Deletes a microfrontend by ID
export function deleteMicrofrontend({
  versionId,
  id,
}: {
  versionId: string;
  id: string;
}): Promise<void> {
  return axios.delete(`admin-api/versions/${versionId}/microfrontends/${id}`).then(() => undefined);
}
