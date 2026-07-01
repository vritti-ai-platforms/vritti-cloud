import { plansQueryKey, usePlans } from '@hooks/admin/versions/businesses/plans';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { type ColumnDef, DataTable, RowActions, useDataTable } from '@vritti/quantum-ui/DataTable';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useDialog } from '@vritti/quantum-ui/hooks';
import { buildSlug } from '@vritti/quantum-ui/slug';
import { CreditCard, Eye, Plus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useVersionContext } from '@/context/VersionScopeContext';
import type { Plan } from '@/schemas/admin/plans';
import { AddPlanForm } from '../plans/forms/AddPlanForm';

export const PlansTab = () => {
  const { versionId, businessId } = useVersionContext();
  const navigate = useNavigate();
  const { versionSlug, businessSlug } = useParams();
  const queryClient = useQueryClient();
  const { data: response, isLoading } = usePlans(versionId, businessId);
  const addDialog = useDialog();

  const { table } = useDataTable({
    columns: getColumns({
      onView: (p) => navigate(`/versions/${versionSlug}/businesses/${businessSlug}/plans/${buildSlug(p.name, p.id)}`),
    }),
    slug: `plans-${businessId}`,
    label: 'plan',
    serverState: response,
    enableRowSelection: false,
    enableSorting: true,
    enableMultiSort: false,
    onStatePush: () => queryClient.invalidateQueries({ queryKey: plansQueryKey(versionId, businessId) }),
  });

  return (
    <div className="pt-4 flex flex-col gap-4">
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
        toolbarActions={{
          actions: (
            <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={addDialog.open}>
              Add Plan
            </Button>
          ),
        }}
        emptyStateConfig={{
          icon: CreditCard,
          title: 'No plans for this business',
          description: 'Add a plan to define what this business offers under this version.',
          action: (
            <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={addDialog.open}>
              Add Plan
            </Button>
          ),
        }}
      />

      <Dialog
        handle={addDialog}
        icon={CreditCard}
        title="Add Plan"
        description="Enter the details for the new plan."
        content={(close) => <AddPlanForm onSuccess={close} onCancel={close} />}
      />
    </div>
  );
};

function getColumns({ onView }: { onView: (plan: Plan) => void }): ColumnDef<Plan, unknown>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Plan',
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-2">
          <span>{row.original.name}</span>
          {row.original.isCustom && (
            <Badge variant="secondary" className="text-xs">
              Custom
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono text-xs font-medium">
          {row.original.code}
        </Badge>
      ),
    },
    {
      accessorKey: 'priceCount',
      header: 'Prices',
      cell: ({ row }) => <Badge variant="secondary">{row.original.priceCount} prices</Badge>,
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
