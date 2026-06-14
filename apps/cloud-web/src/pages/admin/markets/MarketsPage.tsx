import { MARKETS_QUERY_KEY, useMarkets } from '@hooks/admin/markets';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { type ColumnDef, DataTable, RowActions, useDataTable } from '@vritti/quantum-ui/DataTable';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useDialog } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { SelectFilter } from '@vritti/quantum-ui/Select';
import { buildSlug } from '@vritti/quantum-ui/slug';
import { CheckCircle2, Eye, Globe, Plus, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Market } from '@/schemas/admin/markets';
import { AddMarketForm } from './forms/AddMarketForm';

const TABLE_SLUG = 'markets';

export const MarketsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: response, isLoading } = useMarkets();
  const addDialog = useDialog();

  const { table } = useDataTable({
    columns: getColumns({
      onView: (market) => navigate(`/markets/${buildSlug(market.name, market.id)}`),
    }),
    slug: TABLE_SLUG,
    label: 'market',
    serverState: response,
    enableRowSelection: false,
    enableSorting: true,
    enableMultiSort: false,
    onStatePush: () => queryClient.invalidateQueries({ queryKey: MARKETS_QUERY_KEY }),
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Markets" description="Manage pricing markets and their currencies" />

      <DataTable
        table={table}
        isLoading={isLoading}
        searchConfig={{
          columns: [
            { id: 'name', label: 'Name' },
            { id: 'code', label: 'Code' },
            { id: 'currencyCode', label: 'Currency' },
          ],
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
              Add Market
            </Button>
          ),
        }}
        emptyStateConfig={{
          icon: Globe,
          title: 'No markets found',
          description: 'Add your first pricing market to get started.',
          action: (
            <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={addDialog.open}>
              Add Market
            </Button>
          ),
        }}
      />

      <Dialog
        handle={addDialog}
        icon={Globe}
        title="Add Market"
        description="Enter the details for the new pricing market."
        content={(close) => <AddMarketForm onSuccess={close} onCancel={close} />}
      />
    </div>
  );
};

interface ColumnActions {
  onView: (market: Market) => void;
}

function getColumns({ onView }: ColumnActions): ColumnDef<Market, unknown>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Name',
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
      accessorKey: 'currencyCode',
      header: 'Currency',
      cell: ({ row }) => <Badge variant="secondary">{row.original.currencyCode}</Badge>,
    },
    {
      accessorKey: 'countryCount',
      header: 'Countries',
      cell: ({ row }) => <Badge variant="secondary">{row.original.countryCount}</Badge>,
      enableSorting: false,
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
      cell: ({ row }) => (
        <RowActions actions={[{ id: 'view', icon: Eye, label: 'View', onClick: () => onView(row.original) }]} />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
