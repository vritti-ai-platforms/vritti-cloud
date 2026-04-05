import { axios } from '@vritti/quantum-ui/axios';

export interface PresignedUrlResponse {
  url: string;
  expiresIn: number;
}

// Fetches a presigned download URL for a media asset by ID
export function getMediaUrl(mediaId: string): Promise<PresignedUrlResponse> {
  return axios.get<PresignedUrlResponse>(`cloud-api/media/${mediaId}/url`).then((r) => r.data);
}
