import { useApp, useAppFeaturesTable, useToggleAppFeature } from '@hooks/admin/apps';
import { Badge } from '@vritti/quantum-ui/Badge';
import { type ColumnDef, DataTable, useDataTable } from '@vritti/quantum-ui/DataTable';
import { useSlugParams } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Switch } from '@vritti/quantum-ui/Switch';
import { Blocks } from 'lucide-react';
import { DynamicIcon, type IconName } from 'lucide-react/dynamic';
import type { AppFeatureTableRow } from '@/schemas/admin/apps';

interface ColumnActions {
  onToggle: (row: AppFeatureTableRow) => void;
}

function getColumns({ onToggle }: ColumnActions): ColumnDef<AppFeatureTableRow, unknown>[] {
  return [
    {
      accessorKey: 'icon',
      header: '',
      cell: ({ row }) => <DynamicIcon name={row.original.icon as IconName} className="size-4 text-muted-foreground" />,
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      accessorKey: 'name',
      header: 'Feature',
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
      id: 'enabled',
      header: 'Enabled',
      cell: ({ row }) => (
        <Switch
          checked={row.original.isAssigned}
          onCheckedChange={() => onToggle(row.original)}
          description={false}
          aria-label={`${row.original.isAssigned ? 'Disable' : 'Enable'} ${row.original.name}`}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}

export const BusinessAppPage = () => {
  const { id: versionId } = useSlugParams('versionSlug');
  const { id: businessId } = useSlugParams('businessSlug');
  const { id: appId } = useSlugParams('appSlug');

  const { data: app } = useApp(versionId ?? '', businessId ?? '', appId ?? '');
  const { data: response, isLoading } = useAppFeaturesTable(versionId ?? '', businessId ?? '', appId ?? '');
  const toggleMutation = useToggleAppFeature();

  function handleToggle(row: AppFeatureTableRow) {
    toggleMutation.mutate({
      versionId: versionId ?? '',
      businessId: businessId ?? '',
      appId: appId ?? '',
      featureId: row.featureId,
    });
  }

  const { table } = useDataTable({
    columns: getColumns({ onToggle: handleToggle }),
    slug: `app-features-${appId}`,
    label: 'feature',
    serverState: response,
    enableRowSelection: false,
    enableSorting: true,
    enableMultiSort: false,
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={app.name}
        description={app.description || `Enable features for ${app.name} in this business`}
      />

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
        emptyStateConfig={{
          icon: Blocks,
          title: 'No features found',
          description: 'No features have been created for this version yet.',
        }}
      />
    </div>
  );
};
