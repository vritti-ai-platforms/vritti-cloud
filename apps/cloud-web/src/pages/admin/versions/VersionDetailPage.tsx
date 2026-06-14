import { useVersion } from '@hooks/admin/versions';
import { Button } from '@vritti/quantum-ui/Button';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useDialog, useSlugParams } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Tabs } from '@vritti/quantum-ui/Tabs';
import { GitBranch, Pencil } from 'lucide-react';
import { BusinessesTab } from './businesses/BusinessesTab';
import { FeaturesPage } from './features/FeaturesPage';
import { EditVersionForm } from './forms/EditVersionForm';
import { MicrofrontendsPage } from './microfrontends/MicrofrontendsPage';
import { OverviewPage } from './overview/OverviewPage';

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
          { value: 'overview', label: 'Overview', content: <OverviewPage versionId={versionId} /> },
          { value: 'microfrontends', label: 'Microfrontends', content: <MicrofrontendsPage /> },
          { value: 'features', label: 'Features', content: <FeaturesPage /> },
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
