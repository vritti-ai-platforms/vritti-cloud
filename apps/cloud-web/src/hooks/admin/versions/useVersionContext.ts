import { useSlugParams } from '@vritti/quantum-ui/hooks';

interface VersionContext {
  versionId: string;
}

// Reads the versionId from the :versionSlug route param
export function useVersionContext(): VersionContext {
  const { id } = useSlugParams('versionSlug');
  return { versionId: id ?? '' };
}
