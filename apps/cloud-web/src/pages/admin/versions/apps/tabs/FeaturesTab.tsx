import { APP_FEATURES_TABLE_KEY, useAppFeaturesTable, useRemoveAppFeature } from '@hooks/admin/apps';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { type ColumnDef, DataTable, RowActions, useDataTable } from '@vritti/quantum-ui/DataTable';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useConfirm, useDialog } from '@vritti/quantum-ui/hooks';
import { Blocks, Plus, Trash2 } from 'lucide-react';
import { useVersionContext } from '@/hooks/admin/versions/useVersionContext';
import type { AppFeatureTableRow } from '@/schemas/admin/apps';
import { AssignFeatureForm } from '../forms/AssignFeatureForm';

interface ColumnActions {
  onRemove: (row: AppFeatureTableRow) => void;
}

// Builds column definitions for the app features data table
function getColumns({ onRemove }: ColumnActions): ColumnDef<AppFeatureTableRow, unknown>[] {
  return [
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
      accessorKey: 'name',
      header: 'Name',
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <RowActions
          actions={[
            { id: 'remove', icon: Trash2, label: 'Remove', variant: 'destructive', onClick: () => onRemove(row.original) },
          ]}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}

// Features tab — data table of assigned features with search and assign dialog
export const FeaturesTab = ({ appId }: { appId: string }) => {
  const queryClient = useQueryClient();
  const { versionId } = useVersionContext();
  const { data: response, isLoading } = useAppFeaturesTable(versionId, appId);
  const confirm = useConfirm();
  const assignDialog = useDialog();
  const removeMutation = useRemoveAppFeature();

  async function handleRemove(row: AppFeatureTableRow) {
    const confirmed = await confirm({
      title: `Remove ${row.name}?`,
      description: 'This feature will be unassigned from the app.',
      confirmLabel: 'Remove',
      variant: 'destructive',
    });
    if (confirmed) removeMutation.mutate({ versionId, appId, featureId: row.featureId });
  }

  const { table } = useDataTable({
    columns: getColumns({ onRemove: handleRemove }),
    slug: `app-features-${appId}`,
    label: 'feature',
    serverState: response,
    enableRowSelection: false,
    enableSorting: true,
    enableMultiSort: false,
    onStatePush: () => queryClient.invalidateQueries({ queryKey: APP_FEATURES_TABLE_KEY(versionId, appId) }),
  });

  return (
    <div className="flex flex-col gap-4 pt-4">
      <DataTable
        table={table}
        isLoading={isLoading}
        searchConfig={{
          columns: [
            { id: 'code', label: 'Code' },
            { id: 'name', label: 'Name' },
          ],
          searchAll: true,
        }}
        toolbarActions={{
          actions: (
            <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={assignDialog.open}>
              Assign Features
            </Button>
          ),
        }}
        emptyStateConfig={{
          icon: Blocks,
          title: 'No features assigned',
          description: 'Assign features from the catalog to this app.',
          action: (
            <Button size="sm" onClick={assignDialog.open}>
              <Plus className="size-4" />
              Assign Features
            </Button>
          ),
        }}
      />

      <Dialog
        handle={assignDialog}
        title="Assign Features"
        description="Select features to assign to this app."
        content={(close) => (
          <AssignFeatureForm
            appId={appId}
            onSuccess={close}
            onCancel={close}
          />
        )}
      />
    </div>
  );
};
