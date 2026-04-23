import { roleTemplateAppsTableKey, useAddRoleTemplateApp, useRemoveRoleTemplateApp, useRoleTemplateAppsTable } from '@hooks/admin/role-templates';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Checkbox } from '@vritti/quantum-ui/Checkbox';
import { type ColumnDef, DataTable, useDataTable } from '@vritti/quantum-ui/DataTable';
import { Boxes } from 'lucide-react';
import { DynamicIcon, type IconName } from 'lucide-react/dynamic';
import { useVersionContext } from '@/hooks/admin/versions/useVersionContext';
import type { RoleTemplateAppTableRow } from '@/schemas/admin/role-templates';

function getColumns(onToggle: (row: RoleTemplateAppTableRow) => void): ColumnDef<RoleTemplateAppTableRow, unknown>[] {
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

export const AppsTab = ({ roleId }: { roleId: string }) => {
  const queryClient = useQueryClient();
  const { versionId } = useVersionContext();
  const { data: response, isLoading } = useRoleTemplateAppsTable(versionId, roleId);
  const assignMutation = useAddRoleTemplateApp();
  const removeMutation = useRemoveRoleTemplateApp();

  function handleToggle(row: RoleTemplateAppTableRow) {
    if (row.isAssigned) {
      removeMutation.mutate(
        { versionId, roleTemplateId: roleId, appId: row.appId },
        { onSuccess: () => queryClient.invalidateQueries({ queryKey: roleTemplateAppsTableKey(versionId, roleId) }) },
      );
    } else {
      assignMutation.mutate(
        { versionId, roleTemplateId: roleId, appId: row.appId },
        { onSuccess: () => queryClient.invalidateQueries({ queryKey: roleTemplateAppsTableKey(versionId, roleId) }) },
      );
    }
  }

  const { table } = useDataTable({
    columns: getColumns(handleToggle),
    slug: `role-template-apps-${roleId}`,
    label: 'app',
    serverState: response,
    enableRowSelection: false,
    enableSorting: true,
    enableMultiSort: false,
    onStatePush: () => queryClient.invalidateQueries({ queryKey: roleTemplateAppsTableKey(versionId, roleId) }),
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
          icon: Boxes,
          title: 'No apps found',
          description: 'No apps have been created for this version yet.',
        }}
      />
    </div>
  );
};
