import { COUNTRIES_QUERY_KEY, useCountries, useDeleteCountry } from '@hooks/admin/countries';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { type ColumnDef, DataTable, RowActions, StringCell, useDataTable } from '@vritti/quantum-ui/DataTable';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useConfirm, useDialog } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { SelectFilter } from '@vritti/quantum-ui/Select';
import { CheckCircle2, MapPin, Pencil, Plus, Trash2, XCircle } from 'lucide-react';
import type { Country } from '@/schemas/admin/countries';
import { AddCountryForm } from './forms/AddCountryForm';
import { EditCountryForm } from './forms/EditCountryForm';

const TABLE_SLUG = 'countries';

export const CountriesPage = () => {
  const queryClient = useQueryClient();
  const { data: response, isLoading } = useCountries();
  const addDialog = useDialog();

  const { table } = useDataTable({
    columns: getColumns(),
    slug: TABLE_SLUG,
    label: 'country',
    serverState: response,
    enableRowSelection: false,
    enableSorting: true,
    enableMultiSort: false,
    onStatePush: () => queryClient.invalidateQueries({ queryKey: COUNTRIES_QUERY_KEY }),
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Countries" description="Reference data for countries, currencies, and tax regimes" />

      <DataTable
        table={table}
        isLoading={isLoading}
        searchConfig={{
          columns: [
            { id: 'name', label: 'Name' },
            { id: 'code', label: 'Code' },
            { id: 'defaultCurrency', label: 'Currency' },
          ],
          searchAll: true,
        }}
        filters={[
          <SelectFilter
            key="taxRegime"
            name="taxRegime"
            label="Tax Regime"
            options={[
              { label: 'GST', value: 'GST' },
              { label: 'VAT', value: 'VAT' },
              { label: 'None', value: 'NONE' },
            ]}
          />,
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
              Add Country
            </Button>
          ),
        }}
        emptyStateConfig={{
          icon: MapPin,
          title: 'No countries found',
          description: 'Add your first country to get started.',
          action: (
            <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={addDialog.open}>
              Add Country
            </Button>
          ),
        }}
      />

      <Dialog
        handle={addDialog}
        icon={MapPin}
        title="Add Country"
        description="Enter the details for the new country."
        content={(close) => <AddCountryForm onSuccess={close} onCancel={close} />}
      />
    </div>
  );
};

function getColumns(): ColumnDef<Country, unknown>[] {
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
      accessorKey: 'defaultCurrency',
      header: 'Currency',
      cell: ({ row }) => <Badge variant="secondary">{row.original.defaultCurrency}</Badge>,
    },
    {
      accessorKey: 'taxRegime',
      header: 'Tax Regime',
      cell: ({ row }) => <Badge variant="outline">{row.original.taxRegime}</Badge>,
    },
    {
      accessorKey: 'taxIdLabel',
      header: 'Tax ID',
      enableSorting: false,
      cell: ({ row }) => <StringCell value={row.original.taxIdLabel} />,
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
      cell: ({ row }) => <CountryActions country={row.original} />,
      enableSorting: false,
      enableHiding: false,
    },
  ];
}

// Inline edit/delete actions for each country row
const CountryActions = ({ country }: { country: Country }) => {
  const confirm = useConfirm();
  const deleteMutation = useDeleteCountry();
  const isDeleting = deleteMutation.isPending && deleteMutation.variables === country.id;

  async function handleDelete() {
    const confirmed = await confirm({
      title: `Delete ${country.name}?`,
      description: `${country.name} will be permanently removed. This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (confirmed) deleteMutation.mutate(country.id);
  }

  return (
    <RowActions
      actions={[
        {
          id: 'edit',
          icon: Pencil,
          label: 'Edit',
          dialog: {
            title: 'Edit Country',
            description: 'Update the details for this country.',
            content: (close) => <EditCountryForm country={country} onSuccess={close} onCancel={close} />,
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
