import { useBusinesses, useDeleteBusiness } from '@hooks/admin/businesses';
import { BUSINESSES_QUERY_KEY } from '@hooks/admin/businesses/useBusinesses';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { type ColumnDef, DataTable, RowActions, useDataTable } from '@vritti/quantum-ui/DataTable';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useConfirm, useDialog } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Building2, Pencil, Plus, Trash2 } from 'lucide-react';
import type { Business } from '@/schemas/admin/businesses';
import { AddBusinessForm } from './forms/AddBusinessForm';
import { EditBusinessForm } from './forms/EditBusinessForm';

const TABLE_SLUG = 'businesses';

export const BusinessesPage = () => {
  const queryClient = useQueryClient();
  const { data: response, isLoading } = useBusinesses();
  const confirm = useConfirm();
  const addDialog = useDialog();

  const deleteMutation = useDeleteBusiness();

  async function handleDelete(business: Business) {
    const confirmed = await confirm({
      title: `Delete ${business.name}?`,
      description: `${business.name} will be permanently removed. This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (confirmed) deleteMutation.mutate(business.id);
  }

  const { table } = useDataTable({
    columns: getColumns({
      onDelete: handleDelete,
    }),
    slug: TABLE_SLUG,
    label: 'business',
    serverState: response,
    enableRowSelection: false,
    enableSorting: true,
    enableMultiSort: false,
    onStatePush: () => queryClient.invalidateQueries({ queryKey: BUSINESSES_QUERY_KEY }),
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <PageHeader title="Businesses" description="Manage business classifications" />

      {/* Table */}
      <DataTable
        table={table}
        isLoading={isLoading}
        searchConfig={{
          columns: [
            { id: 'name', label: 'Name' },
            { id: 'code', label: 'Code' },
          ],
          searchAll: true,
        }}
        toolbarActions={{
          actions: (
            <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={addDialog.open}>
              Add Business
            </Button>
          ),
        }}
        emptyStateConfig={{
          icon: Building2,
          title: 'No businesses found',
          description: 'Add your first business classification to get started.',
          action: (
            <Button size="sm" onClick={addDialog.open}>
              <Plus className="size-4" />
              Add Business
            </Button>
          ),
        }}
      />

      <Dialog
        handle={addDialog}
        title="Add Business"
        description="Enter the details for the new business classification."
        content={(close) => <AddBusinessForm onSuccess={close} onCancel={close} />}
      />
    </div>
  );
};

interface ColumnActions {
  onDelete: (business: Business) => void;
}

function getColumns({ onDelete }: ColumnActions): ColumnDef<Business, unknown>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Business',
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.description || '—'}</span>,
    },
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
                title: 'Edit Business',
                description: 'Update the details for this business classification.',
                content: (close) => <EditBusinessForm business={row.original} onSuccess={close} onCancel={close} />,
              },
            },
            {
              id: 'delete',
              icon: Trash2,
              label: 'Delete',
              variant: 'destructive',
              disabled: !row.original.canDelete,
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
