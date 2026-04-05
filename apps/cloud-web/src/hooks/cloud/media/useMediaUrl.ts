import { useQuery } from '@tanstack/react-query';
import { getMediaUrl } from '@/services/cloud/media.service';

export const MEDIA_URL_QUERY_KEY = (mediaId: string) => ['media', mediaId, 'url'] as const;

// Resolves a media ID to a presigned download URL
export function useMediaUrl(mediaId: string | null | undefined) {
  return useQuery({
    queryKey: MEDIA_URL_QUERY_KEY(mediaId!),
    queryFn: () => getMediaUrl(mediaId!),
    enabled: !!mediaId,
    select: (data) => data.url,
    staleTime: 10 * 60 * 1000,
  });
}
