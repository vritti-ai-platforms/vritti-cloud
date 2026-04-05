import { REGIONS_QUERY_KEY, useRegions } from '@hooks/admin/regions';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { type ColumnDef, DataTable, RowActions, useDataTable } from '@vritti/quantum-ui/DataTable';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useDialog, useTheme } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { SelectFilter } from '@vritti/quantum-ui/Select';
import { CloudProviderFilter } from '@vritti/quantum-ui/selects/cloud-provider';
import { buildSlug } from '@vritti/quantum-ui/slug';
import { CheckCircle2, Eye, Globe, Plus, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Region, RegionProvider } from '@/schemas/admin/regions';
import { AddRegionForm } from './forms/AddRegionForm';

const TABLE_SLUG = 'regions';

export const RegionsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: response, isLoading } = useRegions();
  const addDialog = useDialog();

  const { table } = useDataTable({
    columns: getColumns({
      onView: (region) => navigate(`/regions/${buildSlug(region.name, region.id)}`),
    }),
    slug: TABLE_SLUG,
    label: 'region',
    serverState: response,
    enableRowSelection: false,
    enableSorting: true,
    enableMultiSort: false,
    onStatePush: () => queryClient.invalidateQueries({ queryKey: REGIONS_QUERY_KEY }),
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <PageHeader title="Regions" description="Manage geographic deployment regions" />

      {/* Table */}
      <DataTable
        table={table}
        isLoading={isLoading}
        searchConfig={{
          columns: [
            { id: 'name', label: 'Name' },
            { id: 'code', label: 'Code' },
            { id: 'city', label: 'City' },
            { id: 'state', label: 'State' },
            { id: 'country', label: 'Country' },
          ],
          searchAll: true,
        }}
        filters={[
          <CloudProviderFilter key="cloudProviderId" name="cloudProviderId" />,
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
              Add Region
            </Button>
          ),
        }}
        emptyStateConfig={{
          icon: Globe,
          title: 'No regions found',
          description: 'Add your first region to get started.',
          action: (
            <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={addDialog.open}>
              Add Region
            </Button>
          ),
        }}
      />

      <Dialog
        handle={addDialog}
        title="Add Region"
        description="Enter the details for the new deployment region."
        content={(close) => <AddRegionForm onSuccess={close} onCancel={close} />}
      />
    </div>
  );
};

const ProviderIcons = ({ providers }: { providers: RegionProvider[] }) => {
  const { theme } = useTheme();
  if (!providers || providers.length === 0) return <span className="text-muted-foreground text-sm">—</span>;
  return (
    <div className="flex items-center gap-1.5">
      {providers.map((p) => {
        const src = theme === 'dark' ? (p.logoDarkUrl ?? p.logoUrl) : p.logoUrl;
        return src ? (
          <img key={p.id} src={src} alt={p.name} title={p.name} className="size-5 object-contain shrink-0" />
        ) : (
          <span key={p.id} title={p.name} className="text-xs text-muted-foreground font-mono">
            {p.name}
          </span>
        );
      })}
    </div>
  );
};

interface ColumnActions {
  onView: (region: Region) => void;
}

function getColumns({ onView }: ColumnActions): ColumnDef<Region, unknown>[] {
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
      accessorKey: 'city',
      header: 'City',
    },
    {
      accessorKey: 'state',
      header: 'State',
    },
    {
      accessorKey: 'country',
      header: 'Country',
    },
    {
      accessorKey: 'providers',
      header: 'Providers',
      cell: ({ row }) => <ProviderIcons providers={row.original.providers} />,
      enableSorting: false,
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) =>
        row.original.isActive ? (
          <div className="flex items-center gap-1.5 text-success text-sm">
            <CheckCircle2 className="size-4" />
            Active
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
            <XCircle className="size-4" />
            Inactive
          </div>
        ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <RowActions
          actions={[
            { id: 'view', icon: Eye, label: 'View', onClick: () => onView(row.original) },
          ]}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
