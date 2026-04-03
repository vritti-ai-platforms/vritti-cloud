import { APP_FEATURES_TABLE_KEY, useAppFeaturesTable, useAssignAppFeature, useRemoveAppFeature } from '@hooks/admin/apps';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Checkbox } from '@vritti/quantum-ui/Checkbox';
import { type ColumnDef, DataTable, useDataTable } from '@vritti/quantum-ui/DataTable';
import { Blocks } from 'lucide-react';
import { DynamicIcon, type IconName } from 'lucide-react/dynamic';
import { useVersionContext } from '@/hooks/admin/versions/useVersionContext';
import type { AppFeatureTableRow } from '@/schemas/admin/apps';

function getColumns(onToggle: (row: AppFeatureTableRow) => void): ColumnDef<AppFeatureTableRow, unknown>[] {
  return [
    {
      id: 'assigned',
      header: '',
      cell: ({ row }) => (
        <Checkbox
          checked={row.original.isAssigned}
          onCheckedChange={() => onToggle(row.original)}
          aria-label={`${row.original.isAssigned ? 'Remove' : 'Assign'} ${row.original.name}`}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      accessorKey: 'icon',
      header: '',
      cell: ({ row }) => <DynamicIcon name={row.original.icon as IconName} className="size-4 text-muted-foreground" />,
      enableSorting: false,
      enableHiding: false,
      size: 40,
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
      accessorKey: 'name',
      header: 'Name',
    },
  ];
}

export const FeaturesTab = ({ appId }: { appId: string }) => {
  const queryClient = useQueryClient();
  const { versionId } = useVersionContext();
  const { data: response, isLoading } = useAppFeaturesTable(versionId, appId);
  const assignMutation = useAssignAppFeature();
  const removeMutation = useRemoveAppFeature();

  function handleToggle(row: AppFeatureTableRow) {
    if (row.isAssigned) {
      removeMutation.mutate(
        { versionId, appId, featureId: row.featureId },
        { onSuccess: () => queryClient.invalidateQueries({ queryKey: APP_FEATURES_TABLE_KEY(versionId, appId) }) },
      );
    } else {
      assignMutation.mutate(
        { versionId, appId, featureId: row.featureId },
        { onSuccess: () => queryClient.invalidateQueries({ queryKey: APP_FEATURES_TABLE_KEY(versionId, appId) }) },
      );
    }
  }

  const { table } = useDataTable({
    columns: getColumns(handleToggle),
    slug: `app-features-${appId}`,
    label: 'feature',
    serverState: response,
    enableRowSelection: false,
    enableSorting: true,
    enableMultiSort: false,
    onStatePush: () => queryClient.invalidateQueries({ queryKey: APP_FEATURES_TABLE_KEY(versionId, appId) }),
  });

  return (
    <div className="flex flex-col gap-4 pt-4">
      <DataTable
        table={table}
        isLoading={isLoading}
        mode="compact"
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
