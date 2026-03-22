import {
  appVersionQueryKey,
  useAppVersion,
  useDeleteAppVersion,
  useFinalizeAppVersion,
} from '@hooks/admin/app-versions';
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
import { Calendar, Check, GitBranch, Lock, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVersionContext } from '@/hooks/admin/app-versions/useVersionContext';
import type { AppVersion, AppVersionStatus } from '@/schemas/admin/app-versions';
import { getAppVersion } from '@/services/admin/app-versions.service';
import { EditAppVersionForm } from './forms/EditAppVersionForm';

// Maps version status to badge variant
function statusVariant(status: AppVersionStatus): 'secondary' | 'outline' | 'default' {
  switch (status) {
    case 'DRAFT':
      return 'secondary';
    case 'READY':
      return 'outline';
    case 'PUBLISHED':
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
      queryClient.fetchQuery<AppVersion>({
        queryKey: appVersionQueryKey(versionId),
        queryFn: () => getAppVersion(versionId),
      }),
      queryClient.invalidateQueries({ queryKey: ['select-resolve', 'admin-api/app-versions/select'] }),
      queryClient.invalidateQueries({ queryKey: ['select-search', 'admin-api/app-versions/select'] }),
    ]);
    navigate(`/app-versions/ver-${buildSlug(updated.name, updated.id)}/overview`, { replace: true });
  }

  const { data: version, isLoading } = useAppVersion(versionId);

  const finalizeMutation = useFinalizeAppVersion();
  const deleteMutation = useDeleteAppVersion({
    onSuccess: () => navigate('/app-versions'),
  });

  // Prompt confirmation then finalize
  async function handleFinalize() {
    const confirmed = await confirm({
      title: 'Finalize this version?',
      description:
        'Once finalized, no further changes can be made to features, apps, or microfrontends in this version.',
      confirmLabel: 'Finalize',
    });
    if (confirmed) finalizeMutation.mutate(versionId);
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
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-24" />
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
            {version.status === 'DRAFT' && (
              <>
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
                  startAdornment={<Check className="size-4" />}
                  onClick={handleFinalize}
                >
                  Finalize
                </Button>
              </>
            )}
          </div>
        }
      />

      {/* Info cards */}
      <div className="grid grid-cols-3 gap-4">
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
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <Typography variant="body2" intent="muted">
                Finalized
              </Typography>
              <Typography variant="body1" className="font-semibold">
                {version.finalizedAt ? new Date(version.finalizedAt).toLocaleDateString() : '—'}
              </Typography>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Danger zone — only for DRAFT */}
      {version.status === 'DRAFT' && (
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
        content={(close) => <EditAppVersionForm version={version} onSuccess={handleEditSuccess} onCancel={close} />}
      />
    </div>
  );
};
