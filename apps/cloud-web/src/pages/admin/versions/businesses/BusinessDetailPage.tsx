import { useVersionBusinesses } from '@hooks/admin/version-businesses';
import { useSlugParams } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Tabs } from '@vritti/quantum-ui/Tabs';
import { AppsTab } from './AppsTab';
import { BusinessFeaturesTab } from './BusinessFeaturesTab';
import { PlansTab } from './PlansTab';
import { RoleTemplatesTab } from './RoleTemplatesTab';

export const BusinessDetailPage = () => {
  const { id: versionId } = useSlugParams('versionSlug');
  const { id: businessId } = useSlugParams('businessSlug');

  const { data: businesses } = useVersionBusinesses(versionId ?? '');
  const business = businesses?.find((b) => b.id === businessId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={business?.name ?? 'Business'}
        description="Manage apps, role templates and permissions for this business"
      />

      <Tabs
        routeParam="businessTab"
        contentClassName="min-h-[500px]"
        tabs={[
          {
            value: 'apps',
            label: 'Apps',
            content: <AppsTab versionId={versionId ?? ''} businessId={businessId ?? ''} />,
          },
          {
            value: 'features',
            label: 'Features',
            content: <BusinessFeaturesTab versionId={versionId ?? ''} businessId={businessId ?? ''} />,
          },
          {
            value: 'plans',
            label: 'Plans',
            content: <PlansTab versionId={versionId ?? ''} businessId={businessId ?? ''} />,
          },
          {
            value: 'role-templates',
            label: 'Role Templates',
            content: <RoleTemplatesTab versionId={versionId ?? ''} businessId={businessId ?? ''} />,
          },
        ]}
      />
    </div>
  );
};
