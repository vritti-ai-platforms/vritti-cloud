import { ROLES_QUERY_KEY, useRoles } from '@hooks/admin/roles';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { type ColumnDef, DataTable, RowActions, useDataTable } from '@vritti/quantum-ui/DataTable';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useDialog } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { buildSlug } from '@vritti/quantum-ui/utils/slug';
import { ValueFilter } from '@vritti/quantum-ui/ValueFilter';
import { Eye, Plus, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVersionContext } from '@/hooks/admin/app-versions/useVersionContext';
import type { Role } from '@/schemas/admin/roles';
import { AddRoleForm } from './forms/AddRoleForm';

const TABLE_SLUG = 'roles';

export const AdminRolesPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { versionId } = useVersionContext();
  const { data: response, isLoading } = useRoles(versionId);
  const addDialog = useDialog();

  const { table } = useDataTable({
    columns: getColumns({
      onView: (role) => navigate(buildSlug(role.name, role.id)),
    }),
    slug: TABLE_SLUG,
    label: 'role',
    serverState: response,
    enableRowSelection: false,
    enableSorting: true,
    enableMultiSort: false,
    onStatePush: () => queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY(versionId) }),
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <PageHeader title="Roles" description="Manage role templates for access control" />

      {/* Table */}
      <DataTable
        table={table}
        isLoading={isLoading}
        searchConfig={{
          columns: [{ id: 'name', label: 'Name' }],
          searchAll: true,
        }}
        filters={[<ValueFilter key="scope" name="scope" label="Scope" fieldType="string" />]}
        toolbarActions={{
          actions: (
            <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={addDialog.open}>
              Add Role
            </Button>
          ),
        }}
        emptyStateConfig={{
          icon: Shield,
          title: 'No roles found',
          description: 'Add your first role template to get started.',
          action: (
            <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={addDialog.open}>
              Add Role
            </Button>
          ),
        }}
      />

      <Dialog
        open={addDialog.isOpen}
        onOpenChange={(v) => {
          if (!v) addDialog.close();
        }}
        title="Add Role"
        description="Enter the details for the new role template."
        content={(close) => <AddRoleForm onSuccess={close} onCancel={close} />}
      />
    </div>
  );
};

interface ColumnActions {
  onView: (role: Role) => void;
}

function getColumns({ onView }: ColumnActions): ColumnDef<Role, unknown>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Role',
    },
    {
      accessorKey: 'scope',
      header: 'Scope',
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.scope.toLowerCase().replace('_', ' ')}
        </Badge>
      ),
    },
    {
      accessorKey: 'industryName',
      header: 'Industry',
      cell: ({ row }) => <span className="text-sm">{row.original.industryName ?? 'All'}</span>,
    },
    {
      accessorKey: 'permissionCount',
      header: 'Permissions',
      cell: ({ row }) => <Badge variant="secondary">{row.original.permissionCount}</Badge>,
    },
    {
      accessorKey: 'isSystem',
      header: 'System',
      cell: ({ row }) =>
        row.original.isSystem ? (
          <Badge className="bg-success/15 text-success border-success/30">System</Badge>
        ) : (
          <span className="text-sm text-muted-foreground">Custom</span>
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
