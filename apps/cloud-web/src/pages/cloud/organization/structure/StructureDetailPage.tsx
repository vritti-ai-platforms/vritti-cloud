import { Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { OrganizationSettingsPage } from '../settings/OrganizationSettingsPage';
import { LegalEntityViewPage } from './legal-entity/LegalEntityViewPage';
import { LegalEntityViewPageSkeleton } from './legal-entity/LegalEntityViewPageSkeleton';
import { SiteViewPage } from './site/SiteViewPage';
import { SiteGroupViewPage } from './site-group/SiteGroupViewPage';
import { SiteGroupViewPageSkeleton } from './site-group/SiteGroupViewPageSkeleton';

// Dispatches the structure detail route by slug prefix
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
