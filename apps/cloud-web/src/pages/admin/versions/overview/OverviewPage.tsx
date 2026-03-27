import { useCreateSnapshot, useDeleteVersion, useVersion } from '@hooks/admin/versions';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { DangerZone } from '@vritti/quantum-ui/DangerZone';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useConfirm, useDialog } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Typography } from '@vritti/quantum-ui/Typography';
import { buildSlug } from '@vritti/quantum-ui/utils/slug';
import { Calendar, Camera, GitBranch, Pencil } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVersionContext } from '@/hooks/admin/versions/useVersionContext';
import type { VersionStatus } from '@/schemas/admin/versions';
import { EditVersionForm } from '../forms/EditVersionForm';
import { SnapshotView } from './components/SnapshotView';

// Maps version status to badge variant
function statusVariant(status: VersionStatus): 'secondary' | 'outline' | 'default' {
  switch (status) {
    case 'ALPHA':
      return 'secondary';
    case 'BETA':
      return 'outline';
    case 'PROD':
      return 'default';
  }
}

export const OverviewPage = () => {
  const { versionId } = useVersionContext();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const editDialog = useDialog();

  const { data: version } = useVersion(versionId);

  // Keep URL slug in sync when version name changes after edit
  useEffect(() => {
    const expectedSlug = `ver-${buildSlug(version.name, version.id)}`;
    navigate(`/versions/${expectedSlug}/overview`, { replace: true });
  }, [version.name, version.id, navigate]);

  const snapshotMutation = useCreateSnapshot();
  const deleteMutation = useDeleteVersion({
    onSuccess: () => navigate('/versions'),
  });

  // Prompt confirmation then create snapshot
  async function handleCreateSnapshot() {
    const confirmed = await confirm({
      title: 'Create snapshot?',
      description:
        'This will build a snapshot from all features, apps, microfrontends, and role templates in this version.',
      confirmLabel: 'Create Snapshot',
    });
    if (confirmed) snapshotMutation.mutate(versionId);
  }

  // Prompt confirmation then delete
  async function handleDelete() {
    const confirmed = await confirm({
      title: `Delete ${version?.name}?`,
      description: `Version ${version?.version} will be permanently removed. This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (confirmed) deleteMutation.mutate(versionId);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <PageHeader
        title={version.name}
        description={`Version ${version.version}`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              startAdornment={<Pencil className="size-4" />}
              onClick={editDialog.open}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              startAdornment={<Camera className="size-4" />}
              onClick={handleCreateSnapshot}
            >
              Create Snapshot
            </Button>
          </div>
        }
      />

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
              <GitBranch className="h-6 w-6 text-primary" />
            </div>
            <div>
              <Typography variant="body2" intent="muted">
                Status
              </Typography>
              <Badge variant={statusVariant(version.status)} className="mt-1">
                {version.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <Typography variant="body2" intent="muted">
                Created
              </Typography>
              <Typography variant="body1" className="font-semibold">
                {new Date(version.createdAt).toLocaleDateString()}
              </Typography>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Snapshot visualization */}
      {version.snapshot && <SnapshotView snapshot={version.snapshot} />}

      {/* Danger zone — PROD versions cannot be deleted */}
      {version.status !== 'PROD' && (
        <DangerZone
          title="Delete this version"
          description="This action cannot be undone. All features, apps, and role templates in this version will be permanently removed."
          buttonText="Delete Version"
          onClick={handleDelete}
        />
      )}

      {/* Edit dialog */}
      <Dialog
        handle={editDialog}
        title="Edit Version"
        description="Update the version name and number."
        content={(close) => <EditVersionForm version={version} onSuccess={close} onCancel={close} />}
      />
    </div>
  );
};
