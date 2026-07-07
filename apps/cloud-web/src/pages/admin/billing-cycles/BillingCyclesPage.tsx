import { BILLING_CYCLES_QUERY_KEY, useBillingCycles, useDeleteBillingCycle } from '@hooks/admin/billing-cycles';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@vritti/quantum-ui/Button';
import { type ColumnDef, DataTable, NumberCell, RowActions, useDataTable } from '@vritti/quantum-ui/DataTable';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useConfirm, useDialog } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { SelectFilter } from '@vritti/quantum-ui/Select';
import { CalendarClock, CheckCircle2, Pencil, Plus, Repeat, Trash2, XCircle } from 'lucide-react';
import type { BillingCycle } from '@/schemas/admin/billing-cycles';
import { AddBillingCycleForm } from './forms/AddBillingCycleForm';
import { EditBillingCycleForm } from './forms/EditBillingCycleForm';

const TABLE_SLUG = 'billing-cycles';

export const BillingCyclesPage = () => {
  const queryClient = useQueryClient();
  const { data: response, isLoading } = useBillingCycles();
  const addDialog = useDialog();

  const { table } = useDataTable({
    columns: getColumns(),
    slug: TABLE_SLUG,
    label: 'billing cycle',
    serverState: response,
    enableRowSelection: false,
    enableSorting: true,
    enableMultiSort: false,
    onStatePush: () => queryClient.invalidateQueries({ queryKey: BILLING_CYCLES_QUERY_KEY }),
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Billing Cycles" description="Reference data for subscription billing periods" />

      <DataTable
        table={table}
        isLoading={isLoading}
        searchConfig={{
          columns: [{ id: 'name', label: 'Name' }],
          searchAll: true,
        }}
        filters={[
          <SelectFilter
            key="isActive"
            name="isActive"
            label="Status"
            options={[
              { label: 'Active', value: 'true' },
              { label: 'Inactive', value: 'false' },
            ]}
          />,
        ]}
        toolbarActions={{
          actions: (
            <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={addDialog.open}>
              Add Billing Cycle
            </Button>
          ),
        }}
        emptyStateConfig={{
          icon: Repeat,
          title: 'No billing cycles found',
          description: 'Add your first billing cycle to get started.',
          action: (
            <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={addDialog.open}>
              Add Billing Cycle
            </Button>
          ),
        }}
      />

      <Dialog
        handle={addDialog}
        icon={CalendarClock}
        title="Add Billing Cycle"
        description="Enter the details for the new billing cycle."
        content={(close) => <AddBillingCycleForm onSuccess={close} onCancel={close} />}
      />
    </div>
  );
};

function getColumns(): ColumnDef<BillingCycle, unknown>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'days',
      header: 'Days',
      cell: ({ row }) => <NumberCell value={row.original.days} />,
    },
    {
      accessorKey: 'sortOrder',
      header: 'Sort Order',
      cell: ({ row }) => <NumberCell value={row.original.sortOrder} />,
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) =>
        row.original.isActive ? (
          <div className="flex items-center justify-center gap-1.5 text-success text-sm">
            <CheckCircle2 className="size-4" />
            Active
          </div>
        ) : (
          <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-sm">
            <XCircle className="size-4" />
            Inactive
          </div>
        ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => <BillingCycleActions billingCycle={row.original} />,
      enableSorting: false,
      enableHiding: false,
    },
  ];
}

// Inline edit/delete actions for each billing cycle row
const BillingCycleActions = ({ billingCycle }: { billingCycle: BillingCycle }) => {
  const confirm = useConfirm();
  const deleteMutation = useDeleteBillingCycle();
  const isDeleting = deleteMutation.isPending && deleteMutation.variables === billingCycle.id;

  async function handleDelete() {
    const confirmed = await confirm({
      title: `Delete ${billingCycle.name}?`,
      description: `${billingCycle.name} will be permanently removed. This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (confirmed) deleteMutation.mutate(billingCycle.id);
  }

  return (
    <RowActions
      actions={[
        {
          id: 'edit',
          icon: Pencil,
          label: 'Edit',
          dialog: {
            title: 'Edit Billing Cycle',
            description: 'Update the details for this billing cycle.',
            content: (close) => <EditBillingCycleForm billingCycle={billingCycle} onSuccess={close} onCancel={close} />,
          },
        },
        {
          id: 'delete',
          icon: Trash2,
          label: 'Delete',
          variant: 'destructive',
          disabled: isDeleting,
          onClick: handleDelete,
        },
      ]}
    />
  );
};
