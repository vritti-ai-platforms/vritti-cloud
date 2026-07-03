import { skipToken, useQuery } from '@tanstack/react-query';
import { getMediaUrl } from '@/services/cloud/media.service';

export const MEDIA_URL_QUERY_KEY = (mediaId: string | null | undefined) => ['media', mediaId, 'url'] as const;

// Resolves a media ID to a presigned download URL
export function useMediaUrl(mediaId: string | null | undefined) {
  return useQuery({
    queryKey: MEDIA_URL_QUERY_KEY(mediaId),
    queryFn: mediaId ? () => getMediaUrl(mediaId) : skipToken,
    select: (data) => data.url,
    staleTime: 10 * 60 * 1000,
  });
}
