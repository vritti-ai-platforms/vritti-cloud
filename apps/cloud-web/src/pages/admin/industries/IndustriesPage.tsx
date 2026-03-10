import { useDeleteIndustry, useIndustries } from '@hooks/admin/industries';
import { INDUSTRIES_QUERY_KEY } from '@hooks/admin/industries/useIndustries';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { type ColumnDef, DataTable, useDataTable } from '@vritti/quantum-ui/DataTable';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { DropdownMenu } from '@vritti/quantum-ui/DropdownMenu';
import { useConfirm, useDialog } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Building2, MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import type { Industry } from '@/schemas/admin/industries';
import { AddIndustryForm } from './forms/AddIndustryForm';
import { EditIndustryForm } from './forms/EditIndustryForm';

const TABLE_SLUG = 'industries';

export const IndustriesPage = () => {
  const queryClient = useQueryClient();
  const { data: response, isLoading } = useIndustries();
  const confirm = useConfirm();
  const addDialog = useDialog();

  const deleteMutation = useDeleteIndustry();

  async function handleDelete(industry: Industry) {
    const confirmed = await confirm({
      title: `Delete ${industry.name}?`,
      description: `${industry.name} will be permanently removed. This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (confirmed) deleteMutation.mutate(industry.id);
  }

  const { table } = useDataTable({
    columns: getColumns({ onDelete: handleDelete }),
    slug: TABLE_SLUG,
    label: 'industry',
    serverState: response,
    enableRowSelection: false,
    enableSorting: true,
    enableMultiSort: false,
    onStatePush: () => queryClient.invalidateQueries({ queryKey: INDUSTRIES_QUERY_KEY }),
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <PageHeader title="Industries" description="Manage industry classifications" />

      {/* Table */}
      <DataTable
        table={table}
        isLoading={isLoading}
        onStatePush={() => queryClient.invalidateQueries({ queryKey: INDUSTRIES_QUERY_KEY })}
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
              Add Industry
            </Button>
          ),
        }}
        emptyStateConfig={{
          icon: Building2,
          title: 'No industries found',
          description: 'Add your first industry classification to get started.',
          action: (
            <Button size="sm" onClick={addDialog.open}>
              <Plus className="size-4" />
              Add Industry
            </Button>
          ),
        }}
      />

      <Dialog
        open={addDialog.isOpen}
        onOpenChange={(v) => { if (!v) addDialog.close(); }}
        title="Add Industry"
        description="Enter the details for the new industry classification."
        content={(close) => <AddIndustryForm onSuccess={close} onCancel={close} />}
      />
    </div>
  );
};

interface ColumnActions {
  onDelete: (industry: Industry) => void;
}

function getColumns({ onDelete }: ColumnActions): ColumnDef<Industry, unknown>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Industry',
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
        <DropdownMenu
          trigger={{
            children: (
              <Button variant="ghost" size="icon" className="size-7">
                <MoreVertical className="size-4" />
              </Button>
            ),
          }}
          align="end"
          items={[
            {
              type: 'dialog' as const,
              id: 'edit',
              label: 'Edit',
              icon: Pencil,
              dialog: {
                title: 'Edit Industry',
                description: 'Update the details for this industry classification.',
                content: (close) => (
                  <EditIndustryForm industry={row.original} onSuccess={close} onCancel={close} />
                ),
              },
            },
            {
              type: 'item' as const,
              id: 'delete',
              label: 'Delete',
              icon: Trash2,
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
