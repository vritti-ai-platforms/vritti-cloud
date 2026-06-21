import { useVersion } from '@hooks/admin/versions';
import { Button } from '@vritti/quantum-ui/Button';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useDialog, useSlugParams } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Tabs } from '@vritti/quantum-ui/Tabs';
import { GitBranch, Pencil } from 'lucide-react';
import { EditVersionForm } from './forms/EditVersionForm';
import { BusinessesTab } from './tabs/businesses/BusinessesTab';
import { FeaturesTab } from './tabs/features/FeaturesTab';
import { MicrofrontendsTab } from './tabs/microfrontends/MicrofrontendsTab';
import { OverviewTab } from './tabs/overview/OverviewTab';

export const VersionDetailPage = () => {
  const { id } = useSlugParams('versionSlug');
  const versionId = id ?? '';
  const editDialog = useDialog();

  const { data: version } = useVersion(versionId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={version.name}
        description={`Version ${version.version}`}
        actions={
          <Button variant="outline" size="sm" startAdornment={<Pencil className="size-4" />} onClick={editDialog.open}>
            Edit
          </Button>
        }
      />

      <Tabs
        routeParam="versionTab"
        contentClassName="min-h-[500px]"
        tabs={[
          { value: 'overview', label: 'Overview', content: <OverviewTab versionId={versionId} /> },
          { value: 'microfrontends', label: 'Microfrontends', content: <MicrofrontendsTab /> },
          { value: 'features', label: 'Features', content: <FeaturesTab /> },
          { value: 'businesses', label: 'Businesses', content: <BusinessesTab versionId={versionId} /> },
        ]}
      />

      <Dialog
        handle={editDialog}
        icon={GitBranch}
        title="Edit Version"
        description="Update the version name and number."
        content={(close) => <EditVersionForm version={version} onSuccess={close} onCancel={close} />}
      />
    </div>
  );
};
