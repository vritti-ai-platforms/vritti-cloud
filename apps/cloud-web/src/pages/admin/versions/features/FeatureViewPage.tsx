import { useDeleteFeature, useFeature } from '@hooks/admin/features';
import { Button } from '@vritti/quantum-ui/Button';
import { DangerZone } from '@vritti/quantum-ui/DangerZone';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useConfirm, useDialog, useSlugParams } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Tabs } from '@vritti/quantum-ui/Tabs';
import { useNavigate } from 'react-router-dom';
import { useVersionContext } from '@/hooks/admin/versions/useVersionContext';
import { EditFeatureForm } from './forms/EditFeatureForm';
import { MicrofrontendTab } from './tabs/MicrofrontendTab';
import { PermissionsTab } from './tabs/PermissionsTab';

export const FeatureViewPage = () => {
  const { id } = useSlugParams('featureSlug');
  const navigate = useNavigate();
  const { versionId } = useVersionContext();

  const editDialog = useDialog();
  const confirm = useConfirm();

  const { data: feature } = useFeature(versionId, id);

  const deleteMutation = useDeleteFeature(versionId, {
    onSuccess: () => navigate('../features'),
  });

  // Prompt confirmation then delete
  const handleDelete = async () => {
    if (!id) return;
    const confirmed = await confirm({
      title: `Delete ${feature.name}?`,
      description: `${feature.name} will be permanently removed. This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (confirmed) deleteMutation.mutate(id);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <PageHeader
        title={feature.name}
        description={feature.description || `Manage the ${feature.name} feature`}
        actions={
          <Button variant="outline" size="sm" onClick={editDialog.open}>
            Edit
          </Button>
        }
      />

      {/* Tabs */}
      <Tabs
        defaultValue="microfrontend"
        tabs={[
          { value: 'microfrontend', label: 'Microfrontend', content: <MicrofrontendTab featureId={feature.id} /> },
          { value: 'permissions', label: 'Permissions', content: <PermissionsTab featureId={feature.id} /> },
        ]}
      />

      <DangerZone
        title="Delete this feature"
        description="This action cannot be undone. All associated data will be permanently removed."
        buttonText="Delete Feature"
        onClick={handleDelete}
        disabled={!feature.canDelete}
        warning={
          !feature.canDelete
            ? 'This feature has active dependencies. Remove all associations before deleting.'
            : undefined
        }
      />

      {/* Edit dialog */}
      <Dialog
        handle={editDialog}
        title="Edit Feature"
        description="Update the details for this feature."
        content={(close) => <EditFeatureForm feature={feature} onSuccess={close} onCancel={close} />}
      />
    </div>
  );
};
