import { useDeleteIndustry, useIndustries } from '@hooks/admin/industries';
import { INDUSTRIES_QUERY_KEY } from '@hooks/admin/industries/useIndustries';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { type ColumnDef, DataTable, RowActions, useDataTable } from '@vritti/quantum-ui/DataTable';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useConfirm, useDialog } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { buildSlug } from '@vritti/quantum-ui/utils/slug';
import { Building2, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Industry } from '@/schemas/admin/industries';
import { AddIndustryForm } from './forms/AddIndustryForm';
import { EditIndustryForm } from './forms/EditIndustryForm';

const TABLE_SLUG = 'industries';

export const IndustriesPage = () => {
  const navigate = useNavigate();
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
    columns: getColumns({
      onDelete: handleDelete,
      onView: (industry) => navigate(`/industries/${buildSlug(industry.name, industry.id)}`),
    }),
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
  onView: (industry: Industry) => void;
}

function getColumns({ onDelete, onView }: ColumnActions): ColumnDef<Industry, unknown>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Industry',
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.description || '—'}</span>
      ),
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
            { id: 'view', icon: Eye, label: 'View', onClick: () => onView(row.original) },
            {
              id: 'edit',
              icon: Pencil,
              label: 'Edit',
              dialog: {
                title: 'Edit Industry',
                description: 'Update the details for this industry classification.',
                content: (close) => (
                  <EditIndustryForm industry={row.original} onSuccess={close} onCancel={close} />
                ),
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
