import { useApp, useDeleteApp } from '@hooks/admin/apps';
import { Button } from '@vritti/quantum-ui/Button';
import { DangerZone } from '@vritti/quantum-ui/DangerZone';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useConfirm, useDialog, useSlugParams } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Tabs } from '@vritti/quantum-ui/Tabs';
import { useNavigate } from 'react-router-dom';
import { useVersionContext } from '@/hooks/admin/app-versions/useVersionContext';
import { EditAppForm } from './forms/EditAppForm';
import { AppStats } from './tabs/AppStats';
import { FeaturesTab } from './tabs/FeaturesTab';
import { PricingTab } from './tabs/PricingTab';

export const AppViewPage = () => {
  const { id } = useSlugParams();
  const navigate = useNavigate();
  const { versionId } = useVersionContext();

  const editDialog = useDialog();
  const confirm = useConfirm();

  const { data: app } = useApp(versionId, id ?? '');

  const deleteMutation = useDeleteApp(versionId, {
    onSuccess: () => navigate('..'),
  });

  // Prompt confirmation then delete
  const handleDelete = async () => {
    if (!id) return;
    const confirmed = await confirm({
      title: `Delete ${app.name}?`,
      description: `${app.name} and all its associated data will be permanently removed. This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (confirmed) deleteMutation.mutate(id);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <PageHeader
        title={app.name}
        description={app.description || `Manage the ${app.name} application`}
        actions={
          <Button variant="outline" size="sm" onClick={editDialog.open}>
            Edit
          </Button>
        }
      />

      {/* Stats */}
      <AppStats app={app} />

      {/* Tabs */}
      <Tabs
        defaultValue="features"
        tabs={[
          { value: 'features', label: 'Features', content: <FeaturesTab appId={app.id} /> },
          { value: 'pricing', label: 'App Prices', content: <PricingTab appId={app.id} /> },
        ]}
      />

      <DangerZone
        title="Delete this app"
        description="This action cannot be undone. All associated data will be permanently removed."
        buttonText="Delete App"
        onClick={handleDelete}
        disabled={!app.canDelete}
        warning={
          !app.canDelete
            ? 'This app is assigned to plans or has other dependencies. Remove all associations before deleting.'
            : undefined
        }
      />

      {/* Edit dialog */}
      <Dialog
        open={editDialog.isOpen}
        onOpenChange={(v) => {
          if (!v) editDialog.close();
        }}
        title="Edit App"
        description="Update the details for this application."
        content={(close) => <EditAppForm app={app} onSuccess={close} onCancel={close} />}
      />
    </div>
  );
};
