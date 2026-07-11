import { ROLE_TEMPLATES_QUERY_KEY, useRoleTemplates } from '@hooks/admin/versions/businesses/role-templates';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { type ColumnDef, DataTable, RowActions, StringCell, useDataTable } from '@vritti/quantum-ui/DataTable';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useDialog } from '@vritti/quantum-ui/hooks';
import { buildSlug } from '@vritti/quantum-ui/slug';
import { Eye, Plus, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVersionContext } from '@/context/VersionScopeContext';
import { SCOPE_TYPE_LABELS, SITE_TYPE_LABELS } from '@/schemas/admin/features';
import type { Role } from '@/schemas/admin/role-templates';
import { AddRoleTemplateForm } from '../role-templates/forms/AddRoleTemplateForm';

export const RoleTemplatesTab = () => {
  const { versionId, businessId } = useVersionContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: response, isLoading } = useRoleTemplates(versionId, businessId);
  const addDialog = useDialog();

  const { table } = useDataTable({
    columns: getColumns({
      onView: (role) => navigate(`rt-${buildSlug(role.name, role.id)}`, { relative: 'path' }),
    }),
    slug: `role-templates-${businessId}`,
    label: 'role template',
    serverState: response,
    enableRowSelection: false,
    enableSorting: true,
    enableMultiSort: false,
    onStatePush: () => queryClient.invalidateQueries({ queryKey: ROLE_TEMPLATES_QUERY_KEY(versionId, businessId) }),
  });

  return (
    <div className="flex flex-col gap-4 pt-4">
      <DataTable
        table={table}
        isLoading={isLoading}
        mode="tab"
        searchConfig={{
          columns: [{ id: 'name', label: 'Name' }],
          searchAll: true,
        }}
        toolbarActions={{
          actions: (
            <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={addDialog.open}>
              Add Role Template
            </Button>
          ),
        }}
        emptyStateConfig={{
          icon: Shield,
          title: 'No role templates found',
          description: 'Add the first role template for this business.',
          action: (
            <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={addDialog.open}>
              Add Role Template
            </Button>
          ),
        }}
      />

      <Dialog
        handle={addDialog}
        icon={Shield}
        title="Add Role Template"
        description="Enter the details for the new role template."
        content={(close) => <AddRoleTemplateForm onSuccess={close} onCancel={close} />}
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
      header: 'Role Template',
    },
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => <StringCell value={row.original.code} mono />,
    },
    {
      accessorKey: 'scope',
      header: 'Scope',
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs font-medium">
          {SCOPE_TYPE_LABELS[row.original.scope]}
        </Badge>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'siteType',
      header: 'Site Type',
      cell: ({ row }) =>
        row.original.scope === 'SITE' && row.original.siteType ? (
          <Badge variant="secondary" className="text-xs font-medium">
            {SITE_TYPE_LABELS[row.original.siteType]}
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
      enableSorting: false,
    },
    {
      accessorKey: 'permissionCount',
      header: 'Permissions',
      cell: ({ row }) => <Badge variant="secondary">{row.original.permissionCount}</Badge>,
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
