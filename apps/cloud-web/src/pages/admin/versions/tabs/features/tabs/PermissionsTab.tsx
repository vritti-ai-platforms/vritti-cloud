import {
  FEATURE_PERMISSIONS_KEY,
  useDeletePermission,
  useFeaturePermissions,
  useReorderPermissions,
} from '@hooks/admin/versions/features/permissions';
import { Button } from '@vritti/quantum-ui/Button';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useConfirm, useDialog } from '@vritti/quantum-ui/hooks';
import { SortableItem, SortableList } from '@vritti/quantum-ui/Sortable';
import { Typography } from '@vritti/quantum-ui/Typography';
import { KeyRound, Plus, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useVersionContext } from '@/context/VersionScopeContext';
import type { FeaturePermission } from '@/schemas/admin/feature-permissions';
import { PermissionCard } from '../components/PermissionCard';
import { PermissionUsageBreakdown } from '../components/PermissionUsageBreakdown';
import { AddPermissionForm } from '../forms/AddPermissionForm';
import { QuickAddPermissionsForm } from '../forms/QuickAddPermissionsForm';

export const PermissionsTab = () => {
  const { versionId, featureId } = useVersionContext();
  const { data: permissions } = useFeaturePermissions(versionId, featureId);
  const addDialog = useDialog();
  const quickAddDialog = useDialog();
  const confirm = useConfirm();

  const deleteMutation = useDeletePermission(FEATURE_PERMISSIONS_KEY(versionId, featureId));
  const reorderMutation = useReorderPermissions(FEATURE_PERMISSIONS_KEY(versionId, featureId));

  // Local order seeded from the query so drags feel instant; re-synced whenever the server data changes
  const [orderedPermissions, setOrderedPermissions] = useState<FeaturePermission[]>(permissions ?? []);
  useEffect(() => {
    setOrderedPermissions(permissions ?? []);
  }, [permissions]);

  const existingCodes = orderedPermissions.map((p) => p.code);

  // Optimistically apply the new order, then persist it
  function handleReorder(next: FeaturePermission[]) {
    setOrderedPermissions(next);
    reorderMutation.mutate({ versionId, featureId, orderedIds: next.map((p) => p.id) });
  }

  // Delete with a business-wise usage breakdown — the content component fetches + renders the impact itself
  async function handleDelete(permission: FeaturePermission) {
    const confirmed = await confirm({
      title: `Delete "${permission.label}"?`,
      description: `The "${permission.code}" permission will be removed.`,
      content: <PermissionUsageBreakdown versionId={versionId} permissionId={permission.id} />,
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (confirmed) deleteMutation.mutate({ versionId, permissionId: permission.id });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Typography variant="h6">Permissions</Typography>
          <Typography variant="body2" intent="muted">
            Drag to reorder the actions this feature exposes.
          </Typography>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="sm" startAdornment={<Zap className="size-4" />} onClick={quickAddDialog.open}>
            Quick Add
          </Button>
          <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={addDialog.open}>
            Add Permission
          </Button>
        </div>
      </div>

      {orderedPermissions.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
          <KeyRound className="size-8 text-muted-foreground" />
          <div>
            <Typography variant="body1" className="font-medium">
              No permissions yet
            </Typography>
            <Typography variant="body2" intent="muted">
              Add a permission to define an action this feature exposes.
            </Typography>
          </div>
          <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={addDialog.open}>
            Add Permission
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {/* Column header — widths mirror the row columns so everything snaps into alignment */}
          <div className="flex items-center gap-3 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <span className="w-4 shrink-0" aria-hidden />
            <span className="min-w-0 flex-1">Permission</span>
            <span className="hidden w-44 shrink-0 sm:block">Scope</span>
            <span className="hidden w-56 shrink-0 md:block">Depends on</span>
            <span className="w-16 shrink-0" aria-hidden />
          </div>

          <SortableList
            items={orderedPermissions}
            onReorder={handleReorder}
            strategy="vertical"
            className="flex flex-col gap-2"
          >
            {orderedPermissions.map((permission) => (
              <SortableItem key={permission.id} id={permission.id}>
                {({ isDragging }) => (
                  <PermissionCard permission={permission} isDragging={isDragging} onDelete={handleDelete} />
                )}
              </SortableItem>
            ))}
          </SortableList>
        </div>
      )}

      <Dialog
        handle={addDialog}
        icon={KeyRound}
        title="Add Permission"
        description="Define a permission and the businesses it applies to."
        content={(close) => <AddPermissionForm onSuccess={close} onCancel={close} />}
      />

      <Dialog
        handle={quickAddDialog}
        icon={Zap}
        title="Quick Add Permissions"
        description="Select the standard permissions to add as global (apply to all businesses)."
        content={(close) => (
          <QuickAddPermissionsForm existingCodes={existingCodes} onSuccess={close} onCancel={close} />
        )}
      />
    </div>
  );
};
