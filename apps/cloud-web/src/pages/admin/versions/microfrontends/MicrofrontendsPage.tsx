import { microfrontendsTableKey, useDeleteMicrofrontend, useMicrofrontendsTable } from '@hooks/admin/microfrontends';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { type ColumnDef, DataTable, RowActions, useDataTable } from '@vritti/quantum-ui/DataTable';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useConfirm, useDialog } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Boxes, Pencil, Plus, Trash2 } from 'lucide-react';
import { useVersionContext } from '@/hooks/admin/versions/useVersionContext';
import type { Microfrontend } from '@/schemas/admin/microfrontends';
import { AddMicrofrontendForm } from './forms/AddMicrofrontendForm';
import { EditMicrofrontendForm } from './forms/EditMicrofrontendForm';

const TABLE_SLUG = 'microfrontends';

export const MicrofrontendsPage = () => {
  const { versionId } = useVersionContext();
  const queryClient = useQueryClient();
  const { data: response, isLoading } = useMicrofrontendsTable(versionId);
  const addDialog = useDialog();
  const confirm = useConfirm();

  const deleteMutation = useDeleteMicrofrontend(versionId);

  async function handleDelete(mf: Microfrontend) {
    const confirmed = await confirm({
      title: `Delete ${mf.name}?`,
      description: `${mf.name} will be permanently removed. This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (confirmed && versionId) {
      deleteMutation.mutate({ versionId, id: mf.id });
    }
  }

  const { table } = useDataTable({
    columns: getColumns({ onDelete: handleDelete }),
    slug: TABLE_SLUG,
    label: 'microfrontend',
    serverState: response,
    enableRowSelection: false,
    enableSorting: true,
    enableMultiSort: false,
    onStatePush: () => queryClient.invalidateQueries({ queryKey: microfrontendsTableKey(versionId ?? '') }),
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <PageHeader title="Microfrontends" description="Manage microfrontend bundles for this version" />

      {/* Table */}
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
        filters={[]}
        toolbarActions={{
          actions: (
            <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={addDialog.open}>
              Add Microfrontend
            </Button>
          ),
        }}
        emptyStateConfig={{
          icon: Boxes,
          title: 'No microfrontends found',
          description: 'Add your first microfrontend bundle to this version.',
          action: (
            <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={addDialog.open}>
              Add Microfrontend
            </Button>
          ),
        }}
      />

      {versionId && (
        <Dialog
          handle={addDialog}
          title="Add Microfrontend"
          description="Add a new microfrontend bundle to this version."
          content={(close) => <AddMicrofrontendForm versionId={versionId} onSuccess={close} onCancel={close} />}
        />
      )}
    </div>
  );
};

interface ColumnActions {
  onDelete: (mf: Microfrontend) => void;
}

function getColumns({ onDelete }: ColumnActions): ColumnDef<Microfrontend, unknown>[] {
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
      accessorKey: 'platform',
      header: 'Platform',
      cell: ({ row }) => <Badge variant="secondary">{row.original.platform}</Badge>,
    },
    {
      accessorKey: 'remoteEntry',
      header: 'Remote Entry',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground truncate max-w-64 block">{row.original.remoteEntry}</span>
      ),
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
                title: 'Edit Microfrontend',
                description: 'Update the details for this microfrontend.',
                content: (close) => (
                  <EditMicrofrontendForm microfrontend={row.original} onSuccess={close} onCancel={close} />
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
