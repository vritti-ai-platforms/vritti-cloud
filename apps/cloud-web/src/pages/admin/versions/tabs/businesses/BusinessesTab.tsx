import {
  useUnassignVersionBusiness,
  useVersionBusinessesTable,
  VERSION_BUSINESSES_TABLE_KEY,
} from '@hooks/admin/versions/businesses';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { type ColumnDef, DataTable, RowActions, useDataTable } from '@vritti/quantum-ui/DataTable';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useConfirm, useDialog } from '@vritti/quantum-ui/hooks';
import { buildSlug } from '@vritti/quantum-ui/slug';
import { Briefcase, Eye, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { VersionBusiness } from '@/schemas/admin/version-businesses';
import { AssignBusinessForm } from '../businesses/forms/AssignBusinessForm';

interface ColumnActions {
  onView: (business: VersionBusiness) => void;
  onRemove: (business: VersionBusiness) => void;
}

function getColumns({ onView, onRemove }: ColumnActions): ColumnDef<VersionBusiness, unknown>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Business',
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
      accessorKey: 'appCount',
      header: 'Apps',
      cell: ({ row }) => <Badge variant="secondary">{row.original.appCount} apps</Badge>,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <RowActions
          actions={[
            { id: 'view', icon: Eye, label: 'View', onClick: () => onView(row.original) },
            {
              id: 'remove',
              icon: Trash2,
              label: 'Remove from version',
              variant: 'destructive',
              disabled: row.original.appCount > 0,
              onClick: () => onRemove(row.original),
            },
          ]}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}

export const BusinessesTab = ({ versionId }: { versionId: string }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: response, isLoading } = useVersionBusinessesTable(versionId);
  const assignDialog = useDialog();
  const confirm = useConfirm();

  const unassignMutation = useUnassignVersionBusiness();

  async function handleRemove(business: VersionBusiness) {
    const confirmed = await confirm({
      title: `Remove ${business.name}?`,
      description: `${business.name} will no longer be assigned to this version. This does not delete the business itself.`,
      confirmLabel: 'Remove',
      variant: 'destructive',
    });
    if (confirmed) unassignMutation.mutate({ versionId, businessId: business.id });
  }

  const { table } = useDataTable({
    columns: getColumns({
      onView: (business) => navigate(`biz-${buildSlug(business.name, business.id)}`, { relative: 'path' }),
      onRemove: handleRemove,
    }),
    slug: `version-businesses-${versionId}`,
    label: 'business',
    serverState: response,
    enableRowSelection: false,
    enableSorting: true,
    enableMultiSort: false,
    onStatePush: () => queryClient.invalidateQueries({ queryKey: VERSION_BUSINESSES_TABLE_KEY(versionId) }),
  });

  return (
    <>
      <DataTable
        table={table}
        isLoading={isLoading}
        searchConfig={{
          columns: [
            { id: 'name', label: 'Name' },
            { id: 'code', label: 'Code' },
          ],
          searchAll: true,
        }}
        mode="tab"
        toolbarActions={{
          actions: (
            <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={assignDialog.open}>
              Assign Business
            </Button>
          ),
        }}
        emptyStateConfig={{
          icon: Briefcase,
          title: 'No businesses assigned to this version yet',
          description: 'Assign a business to make it available in this version.',
          action: (
            <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={assignDialog.open}>
              Assign Business
            </Button>
          ),
        }}
      />

      <Dialog
        handle={assignDialog}
        icon={Briefcase}
        title="Assign Business"
        description="Select a business to assign to this version."
        content={(close) => <AssignBusinessForm versionId={versionId} onSuccess={close} onCancel={close} />}
      />
    </>
  );
};
