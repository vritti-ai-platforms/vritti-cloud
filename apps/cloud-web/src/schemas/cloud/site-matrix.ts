// Snapshot-driven Apps & Features matrix shared by the site lock editor and the Create Custom Role picker.

import type { PlatformBucket } from '@vritti/quantum-ui/types/catalog-resolver';

export { PLATFORMS as MATRIX_PLATFORMS } from '@vritti/quantum-ui/types/catalog-resolver';

export const PLATFORM_LABEL: Record<PlatformBucket, string> = { web: 'Web', mobile: 'Mobile' };
