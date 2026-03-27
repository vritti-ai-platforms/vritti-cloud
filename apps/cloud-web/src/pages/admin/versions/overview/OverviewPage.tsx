import { versionQueryKey, useVersion, useCreateSnapshot, useDeleteVersion } from '@hooks/admin/versions';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { DangerZone } from '@vritti/quantum-ui/DangerZone';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useConfirm, useDialog } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';
import { Typography } from '@vritti/quantum-ui/Typography';
import { buildSlug } from '@vritti/quantum-ui/utils/slug';
import { Calendar, Camera, GitBranch, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVersionContext } from '@/hooks/admin/versions/useVersionContext';
import type { Version, VersionStatus } from '@/schemas/admin/versions';
import { getVersion } from '@/services/admin/versions.service';
import { EditVersionForm } from '../forms/EditVersionForm';
import { SnapshotView } from './components/SnapshotView';
import type { Snapshot } from './snapshot-types';

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
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const editDialog = useDialog();

  // After edit, fetch fresh data, invalidate select cache, and navigate to updated slug
  async function handleEditSuccess() {
    editDialog.close();
    const [updated] = await Promise.all([
      queryClient.fetchQuery<Version>({
        queryKey: versionQueryKey(versionId),
        queryFn: () => getVersion(versionId),
      }),
      queryClient.invalidateQueries({ queryKey: ['select-resolve', 'select-api/versions'] }),
      queryClient.invalidateQueries({ queryKey: ['select-search', 'select-api/versions'] }),
    ]);
    navigate(`/versions/ver-${buildSlug(updated.name, updated.id)}/overview`, { replace: true });
  }

  const { data: version, isLoading } = useVersion(versionId);

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  if (!version) return null;

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
      {version.snapshot && <SnapshotView snapshot={version.snapshot as unknown as Snapshot} />}

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
        open={editDialog.isOpen}
        onOpenChange={(v) => {
          if (!v) editDialog.close();
        }}
        title="Edit Version"
        description="Update the version name and number."
        content={(close) => <EditVersionForm version={version} onSuccess={handleEditSuccess} onCancel={close} />}
      />
    </div>
  );
};
