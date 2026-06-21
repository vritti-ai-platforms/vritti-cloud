import {
  FEATURE_PERMISSIONS_TABLE_KEY,
  useDeletePermission,
  useFeaturePermissions,
} from '@hooks/admin/versions/features/permissions';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { type ColumnDef, DataTable, getSelectionColumn, RowActions, useDataTable } from '@vritti/quantum-ui/DataTable';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useConfirm, useDialog } from '@vritti/quantum-ui/hooks';
import { KeyRound, Pencil, Plus, Trash2, Zap } from 'lucide-react';
import { useVersionContext } from '@/context/VersionScopeContext';
import type { FeaturePermission } from '@/schemas/admin/feature-permissions';
import { AddPermissionForm } from '../forms/AddPermissionForm';
import { EditPermissionForm } from '../forms/EditPermissionForm';
import { QuickAddPermissionsForm } from '../forms/QuickAddPermissionsForm';

interface ColumnActions {
  versionId: string;
  featureId: string;
  onDelete: (permission: FeaturePermission) => void;
}

function getColumns({ versionId, featureId, onDelete }: ColumnActions): ColumnDef<FeaturePermission, unknown>[] {
  return [
    getSelectionColumn<FeaturePermission>(),
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono text-[10px] font-medium">
          {row.original.code}
        </Badge>
      ),
    },
    {
      accessorKey: 'label',
      header: 'Label',
    },
    {
      id: 'scope',
      header: 'Scope',
      cell: ({ row }) =>
        row.original.isGlobal ? (
          <Badge variant="secondary">Global</Badge>
        ) : (
          <Badge variant="outline">Business Specific ({row.original.businessIds.length})</Badge>
        ),
      enableSorting: false,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <RowActions
          actions={[
            {
              id: 'edit',
              icon: Pencil,
              label: 'Edit',
              dialog: {
                title: 'Edit Permission',
                description: 'Update this permission and its business scope.',
                content: (close) => (
                  <EditPermissionForm
                    versionId={versionId}
                    featureId={featureId}
                    permission={row.original}
                    onSuccess={close}
                    onCancel={close}
                  />
                ),
              },
            },
            {
              id: 'delete',
              icon: Trash2,
              label: 'Delete',
              variant: 'destructive',
              onClick: () => onDelete(row.original),
            },
          ]}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}

interface PermissionsTabProps {
  featureId: string;
}

export const PermissionsTab = ({ featureId }: PermissionsTabProps) => {
  const { versionId } = useVersionContext();
  const queryClient = useQueryClient();
  const { data: response, isLoading } = useFeaturePermissions(versionId, featureId);
  const addDialog = useDialog();
  const quickAddDialog = useDialog();
  const confirm = useConfirm();

  const deleteMutation = useDeletePermission(FEATURE_PERMISSIONS_TABLE_KEY(versionId, featureId));
  const existingCodes = (response?.result ?? []).map((p) => p.code);

  async function handleDelete(permission: FeaturePermission) {
    const confirmed = await confirm({
      title: `Delete ${permission.label}?`,
      description: `The "${permission.code}" permission will be removed. This cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (confirmed) deleteMutation.mutate({ versionId, permissionId: permission.id });
  }

  async function handleBulkDelete(rows: { original: FeaturePermission }[]) {
    const confirmed = await confirm({
      title: `Delete ${rows.length} permission${rows.length === 1 ? '' : 's'}?`,
      description: 'The selected permissions will be removed. This cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (!confirmed) return;
    for (const row of rows) deleteMutation.mutate({ versionId, permissionId: row.original.id });
    table.resetRowSelection();
  }

  const { table } = useDataTable({
    columns: getColumns({ versionId, featureId, onDelete: handleDelete }),
    slug: `feature-permissions-${featureId}`,
    label: 'permission',
    serverState: response,
    enableRowSelection: true,
    enableSorting: true,
    enableMultiSort: false,
    onStatePush: () =>
      queryClient.invalidateQueries({ queryKey: FEATURE_PERMISSIONS_TABLE_KEY(versionId, featureId) }),
  });

  return (
    <>
      <DataTable
        table={table}
        isLoading={isLoading}
        searchConfig={{
          columns: [
            { id: 'code', label: 'Code' },
            { id: 'label', label: 'Label' },
          ],
          searchAll: true,
        }}
        mode="tab"
        selectActions={(rows) => (
          <Button variant="destructive" size="sm" startAdornment={<Trash2 className="size-4" />} onClick={() => handleBulkDelete(rows)}>
            Delete {rows.length}
          </Button>
        )}
        toolbarActions={{
          actions: (
            <>
              <Button
                variant="outline"
                size="sm"
                startAdornment={<Zap className="size-4" />}
                onClick={quickAddDialog.open}
              >
                Quick Add
              </Button>
              <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={addDialog.open}>
                Add Permission
              </Button>
            </>
          ),
        }}
        emptyStateConfig={{
          icon: KeyRound,
          title: 'No permissions yet',
          description: 'Add a permission to define an action this feature exposes.',
          action: (
            <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={addDialog.open}>
              Add Permission
            </Button>
          ),
        }}
      />

      <Dialog
        handle={addDialog}
        icon={KeyRound}
        title="Add Permission"
        description="Define a permission and the businesses it applies to."
        content={(close) => (
          <AddPermissionForm versionId={versionId} featureId={featureId} onSuccess={close} onCancel={close} />
        )}
      />

      <Dialog
        handle={quickAddDialog}
        icon={Zap}
        title="Quick Add Permissions"
        description="Select the standard permissions to add as global (apply to all businesses)."
        content={(close) => (
          <QuickAddPermissionsForm
            versionId={versionId}
            featureId={featureId}
            existingCodes={existingCodes}
            onSuccess={close}
            onCancel={close}
          />
        )}
      />
    </>
  );
};
