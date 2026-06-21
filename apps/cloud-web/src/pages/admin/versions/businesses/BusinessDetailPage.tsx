import { useVersionBusinesses } from '@hooks/admin/versions/businesses';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Tabs } from '@vritti/quantum-ui/Tabs';
import { useVersionContext } from '@/context/VersionScopeContext';
import { AppsTab } from './tabs/apps/AppsTab';
import { BusinessFeaturesTab } from './tabs/features/BusinessFeaturesTab';
import { PlansTab } from './tabs/plans/PlansTab';
import { RoleTemplatesTab } from './tabs/role-templates/RoleTemplatesTab';

export const BusinessDetailPage = () => {
  const { versionId, businessId } = useVersionContext();

  const { data: businesses } = useVersionBusinesses(versionId);
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
          { value: 'apps', label: 'Apps', content: <AppsTab /> },
          { value: 'features', label: 'Features', content: <BusinessFeaturesTab /> },
          { value: 'plans', label: 'Plans', content: <PlansTab /> },
          { value: 'role-templates', label: 'Role Templates', content: <RoleTemplatesTab /> },
        ]}
      />
    </div>
  );
};
