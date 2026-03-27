import { pricesTableQueryKey, useDeletePrice, usePricesTable } from '@hooks/admin/prices';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { type ColumnDef, DataTable, RowActions, useDataTable } from '@vritti/quantum-ui/DataTable';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useConfirm, useDialog, useSlugParams } from '@vritti/quantum-ui/hooks';
import { Cloud, Globe, Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import type { Price } from '@/schemas/admin/prices';
import { AddPriceForm } from '../forms/AddPriceForm';
import { EditPriceForm } from '../forms/EditPriceForm';

// Prices DataTable — self-contained with its own data fetching
export const PricesTab = () => {
  const { id: planId } = useSlugParams('planSlug');
  const queryClient = useQueryClient();
  const { data: response, isLoading } = usePricesTable(planId ?? '');
  const addPriceDialog = useDialog();

  const columns = useMemo<ColumnDef<Price, unknown>[]>(
    () => [
      {
        accessorKey: 'regionName',
        header: 'Region',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Globe className="size-4 text-muted-foreground" />
            <span>{row.original.regionName}</span>
            <Badge variant="outline" className="font-mono text-xs">
              {row.original.regionCode}
            </Badge>
          </div>
        ),
      },
      {
        accessorKey: 'providerName',
        header: 'Provider',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Cloud className="size-4 text-muted-foreground" />
            <span>{row.original.providerName}</span>
            <Badge variant="secondary" className="font-mono text-xs">
              {row.original.providerCode}
            </Badge>
          </div>
        ),
      },
      {
        accessorKey: 'price',
        header: 'Price',
        enableSorting: true,
      },
      {
        accessorKey: 'currency',
        header: 'Currency',
        cell: ({ row }) => <Badge variant="outline">{row.original.currency}</Badge>,
        enableSorting: false,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => <PriceActions price={row.original} planId={planId ?? ''} />,
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [planId],
  );

  const { table } = useDataTable({
    columns,
    slug: `prices-${planId}`,
    label: 'price',
    serverState: response,
    enableSorting: true,
    enableMultiSort: false,
    enableRowSelection: false,
    onStatePush: () => queryClient.invalidateQueries({ queryKey: pricesTableQueryKey(planId ?? '') }),
  });

  return (
    <div className="pt-4">
      <DataTable
        table={table}
        minHeight="400px"
        isLoading={isLoading}
        searchConfig={{
          columns: [
            { id: 'regionName', label: 'Region' },
            { id: 'providerName', label: 'Provider' },
            { id: 'currency', label: 'Currency' },
          ],
          searchAll: true,
        }}
        toolbarActions={{
          actions: (
            <Button size="sm" variant="default" startAdornment={<Plus className="size-4" />} onClick={addPriceDialog.open}>
              Add Price
            </Button>
          ),
        }}
        emptyStateConfig={{
          title: 'No prices configured',
          description: 'Add a price for a specific industry, region, and cloud provider combination.',
        }}
      />

      <Dialog
        handle={addPriceDialog}
        title="Add Price"
        description="Set a price for a specific industry, region, and cloud provider combination."
        content={(close) => <AddPriceForm planId={planId ?? ''} onSuccess={close} onCancel={close} />}
      />
    </div>
  );
};

// Inline actions for each price row
const PriceActions = ({ price, planId }: { price: Price; planId: string }) => {
  const confirm = useConfirm();
  const deleteMutation = useDeletePrice();
  const isDeleting = deleteMutation.isPending && deleteMutation.variables?.id === price.id;

  async function handleDelete() {
    const confirmed = await confirm({
      title: 'Delete price?',
      description: 'This price entry will be permanently removed. This action cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (confirmed) deleteMutation.mutate({ id: price.id, planId });
  }

  return (
    <RowActions
      actions={[
        {
          id: 'edit',
          icon: Pencil,
          label: 'Edit',
          dialog: {
            title: 'Edit Price',
            description: 'Update the price and currency for this combination.',
            content: (close) => <EditPriceForm price={price} onSuccess={close} onCancel={close} />,
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
