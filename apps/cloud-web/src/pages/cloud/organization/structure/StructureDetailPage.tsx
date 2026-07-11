import { Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { OrganizationSettingsPage } from '../settings/OrganizationSettingsPage';
import { LegalEntityViewPage } from './LegalEntityViewPage';
import { LegalEntityViewPageSkeleton } from './LegalEntityViewPageSkeleton';
import { SiteGroupViewPage } from './SiteGroupViewPage';
import { SiteGroupViewPageSkeleton } from './SiteGroupViewPageSkeleton';
import { SiteViewPage } from './SiteViewPage';

// Dispatches the unified structure detail route by slug prefix (org- / le- / group- / site-)
export const StructureDetailPage = () => {
  const { structureSlug } = useParams<{ structureSlug: string }>();
  if (structureSlug?.startsWith('org-')) return <OrganizationSettingsPage />;
  if (structureSlug?.startsWith('le-')) {
    return (
      <Suspense fallback={<LegalEntityViewPageSkeleton />}>
        <LegalEntityViewPage />
      </Suspense>
    );
  }
  if (structureSlug?.startsWith('group-')) {
    return (
      <Suspense fallback={<SiteGroupViewPageSkeleton />}>
        <SiteGroupViewPage />
      </Suspense>
    );
  }
  return <SiteViewPage />;
};
