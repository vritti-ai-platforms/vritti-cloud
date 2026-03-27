import { PLANS_QUERY_KEY, usePlans } from '@hooks/admin/plans';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { type ColumnDef, DataTable, RowActions, useDataTable } from '@vritti/quantum-ui/DataTable';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useDialog } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { buildSlug } from '@vritti/quantum-ui/utils/slug';
import { ValueFilter } from '@vritti/quantum-ui/ValueFilter';
import { CreditCard, Eye, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Plan } from '@/schemas/admin/plans';
import { AddPlanForm } from './forms/AddPlanForm';

const TABLE_SLUG = 'plans';

export const PlansPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: response, isLoading } = usePlans();
  const addDialog = useDialog();

  const { table } = useDataTable({
    columns: getColumns({
      onView: (p) => navigate(`/plans/${buildSlug(p.name, p.id)}`),
    }),
    slug: TABLE_SLUG,
    label: 'plan',
    serverState: response,
    enableRowSelection: false,
    enableSorting: true,
    enableMultiSort: false,
    onStatePush: () => queryClient.invalidateQueries({ queryKey: PLANS_QUERY_KEY }),
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <PageHeader title="Plans" description="Manage subscription plans" />

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
        filters={[
          <ValueFilter key="name" name="name" label="Name" fieldType="string" />,
          <ValueFilter key="code" name="code" label="Code" fieldType="string" />,
        ]}
        toolbarActions={{
          actions: (
            <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={addDialog.open}>
              Add Plan
            </Button>
          ),
        }}
        emptyStateConfig={{
          icon: CreditCard,
          title: 'No plans found',
          description: 'Add your first subscription plan to get started.',
          action: (
            <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={addDialog.open}>
              Add Plan
            </Button>
          ),
        }}
      />

      <Dialog
        handle={addDialog}
        title="Add Plan"
        description="Enter the details for the new subscription plan."
        content={(close) => <AddPlanForm onSuccess={close} onCancel={close} />}
      />
    </div>
  );
};

interface ColumnActions {
  onView: (plan: Plan) => void;
}

function getColumns({ onView }: ColumnActions): ColumnDef<Plan, unknown>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Plan',
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
      accessorKey: 'priceCount',
      header: 'Prices',
      cell: ({ row }) => <Badge variant="secondary">{row.original.priceCount} prices</Badge>,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <RowActions actions={[{ id: 'view', icon: Eye, label: 'View', onClick: () => onView(row.original) }]} />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
