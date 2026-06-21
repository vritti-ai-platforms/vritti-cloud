import { useCreateSnapshot, useDeleteVersion, useVersion } from '@hooks/admin/versions';
import { Alert } from '@vritti/quantum-ui/Alert';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent } from '@vritti/quantum-ui/Card';
import { DangerZone } from '@vritti/quantum-ui/DangerZone';
import { DateCell } from '@vritti/quantum-ui/DataTable';
import { useConfirm } from '@vritti/quantum-ui/hooks';
import { Typography } from '@vritti/quantum-ui/Typography';
import { Calendar, Camera, GitBranch } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVersionContext } from '@/context/VersionScopeContext';
import type { VersionStatus } from '@/schemas/admin/versions';
import { SnapshotView } from '../overview/components/SnapshotView';

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

export const OverviewTab = () => {
  const { versionId } = useVersionContext();
  const navigate = useNavigate();
  const confirm = useConfirm();

  const { data: version } = useVersion(versionId);

  const snapshotMutation = useCreateSnapshot();
  const deleteMutation = useDeleteVersion({
    onSuccess: () => navigate('/versions'),
  });

  // Prompt confirmation then create/recreate snapshot
  const hasSnapshot = !!version.snapshot;
  async function handleCreateSnapshot() {
    const confirmed = await confirm({
      title: hasSnapshot ? 'Recreate snapshot?' : 'Create snapshot?',
      description: hasSnapshot
        ? 'This will replace the existing snapshot with the current state of all features, apps, microfrontends, and role templates.'
        : 'This will build a snapshot from all features, apps, microfrontends, and role templates in this version.',
      confirmLabel: hasSnapshot ? 'Recreate Snapshot' : 'Create Snapshot',
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
    <div className="flex flex-col gap-6 pt-4">
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
              <DateCell value={version.createdAt} className="font-semibold" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Snapshot sync status */}
      {!version.snapshot && (
        <div className="flex justify-end">
          <Button size="sm" startAdornment={<Camera className="size-4" />} onClick={handleCreateSnapshot}>
            Create Snapshot
          </Button>
        </div>
      )}
      {version.snapshot && (
        <Alert
          variant={version.isSnapshotStale ? 'warning' : 'success'}
          title={version.isSnapshotStale ? 'Snapshot out of sync' : 'Snapshot is up to date'}
          description={version.isSnapshotStale ? 'Data has changed since the last snapshot was created.' : undefined}
          action={
            version.isSnapshotStale ? (
              <Button variant="outline" size="sm" onClick={handleCreateSnapshot} isLoading={snapshotMutation.isPending}>
                Recreate Snapshot
              </Button>
            ) : undefined
          }
        />
      )}

      {/* Snapshot visualization */}
      <SnapshotView snapshot={version.snapshot ?? { features: {}, businesses: {} }} />

      {/* Danger zone — PROD versions cannot be deleted */}
      {version.status !== 'PROD' && (
        <DangerZone
          title="Delete this version"
          description="This action cannot be undone. All features, apps, and role templates in this version will be permanently removed."
          buttonText="Delete Version"
          onClick={handleDelete}
        />
      )}
    </div>
  );
};
