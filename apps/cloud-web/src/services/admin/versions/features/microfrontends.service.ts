import { axios } from '@vritti/quantum-ui/axios';
import type { CreateResponse, SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type { Feature, FeatureMicrofrontendLinks, SetFeatureMicrofrontendData } from '@/schemas/admin/features';
import type { MicrofrontendPlatformParam } from '@/schemas/admin/microfrontends';

// Fetches the per-platform microfrontend links for a feature
export function getFeatureMicrofrontends(versionId: string, featureId: string): Promise<FeatureMicrofrontendLinks> {
  return axios
    .get<FeatureMicrofrontendLinks>(`admin-api/versions/${versionId}/features/${featureId}/microfrontends`)
    .then((r) => r.data);
}

// Links or updates a microfrontend on a feature for a platform
export function setFeatureMicrofrontend({
  versionId,
  featureId,
  platform,
  data,
}: {
  versionId: string;
  featureId: string;
  platform: MicrofrontendPlatformParam;
  data: SetFeatureMicrofrontendData;
}): Promise<CreateResponse<Feature>> {
  return axios
    .put<CreateResponse<Feature>>(
      `admin-api/versions/${versionId}/features/${featureId}/microfrontend/${platform}`,
      data,
    )
    .then((r) => r.data);
}

// Removes a microfrontend link from a feature for a platform
export function removeFeatureMicrofrontend({
  versionId,
  featureId,
  platform,
}: {
  versionId: string;
  featureId: string;
  platform: MicrofrontendPlatformParam;
}): Promise<SuccessResponse> {
  return axios
    .delete<SuccessResponse>(`admin-api/versions/${versionId}/features/${featureId}/microfrontend/${platform}`)
    .then((r) => r.data);
}
