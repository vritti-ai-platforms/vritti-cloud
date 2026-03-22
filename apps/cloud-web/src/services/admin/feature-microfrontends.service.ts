import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import { axios } from '@vritti/quantum-ui/axios';
import type { FeatureMicrofrontend } from '@/schemas/admin/features';

// Fetches all microfrontend links for a feature
export function getFeatureMicrofrontends(versionId: string, featureId: string): Promise<FeatureMicrofrontend[]> {
  return axios
    .get<FeatureMicrofrontend[]>(`admin-api/app-versions/${versionId}/features/${featureId}/microfrontends`)
    .then((r) => r.data);
}

// Links or updates a microfrontend on a feature — microfrontendId in URL, body has only exposedModule + routePrefix
export function setFeatureMicrofrontend({
  versionId,
  featureId,
  microfrontendId,
  data,
}: {
  versionId: string;
  featureId: string;
  microfrontendId: string;
  data: { exposedModule: string; routePrefix: string };
}): Promise<SuccessResponse> {
  return axios
    .put<SuccessResponse>(
      `admin-api/app-versions/${versionId}/features/${featureId}/microfrontends/${microfrontendId}`,
      data,
    )
    .then((r) => r.data);
}

// Removes a microfrontend link from a feature
export function removeFeatureMicrofrontend({
  versionId,
  featureId,
  microfrontendId,
}: {
  versionId: string;
  featureId: string;
  microfrontendId: string;
}): Promise<void> {
  return axios
    .delete(`admin-api/app-versions/${versionId}/features/${featureId}/microfrontends/${microfrontendId}`)
    .then(() => undefined);
}
