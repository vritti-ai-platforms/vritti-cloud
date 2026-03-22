import { PLAN_APPS_TABLE_KEY, usePlanAppsTable, useRemovePlanApp } from '@hooks/admin/plan-apps';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { type ColumnDef, DataTable, useDataTable } from '@vritti/quantum-ui/DataTable';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { DropdownMenu } from '@vritti/quantum-ui/DropdownMenu';
import { useConfirm, useDialog } from '@vritti/quantum-ui/hooks';
import { AppWindow, MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import type { PlanAppTableRow } from '@/schemas/admin/plan-apps';
import { AssignPlanAppForm } from '../forms/AssignPlanAppForm';
import { EditPlanAppForm } from '../forms/EditPlanAppForm';

interface ColumnActions {
  planId: string;
  onRemove: (row: PlanAppTableRow) => void;
}

// Builds column definitions for the plan apps data table
function getColumns({ planId, onRemove }: ColumnActions): ColumnDef<PlanAppTableRow, unknown>[] {
  return [
    {
      accessorKey: 'appCode',
      header: 'App Code',
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono text-[10px] font-medium">
          {row.original.appCode}
        </Badge>
      ),
    },
    {
      accessorKey: 'includedFeatureCodes',
      header: 'Included Features',
      cell: ({ row }) => {
        const codes = row.original.includedFeatureCodes;
        if (!codes) return <Badge variant="secondary">All</Badge>;
        return (
          <div className="flex items-center gap-1">
            <Badge variant="secondary">{codes.length}</Badge>
            <span className="text-xs text-muted-foreground truncate max-w-48">{codes.join(', ')}</span>
          </div>
        );
      },
      enableSorting: false,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu
          trigger={{
            children: (
              <Button variant="ghost" size="icon" className="size-7">
                <MoreVertical className="size-4" />
              </Button>
            ),
          }}
          align="end"
          items={[
            {
              type: 'dialog' as const,
              id: 'edit',
              label: 'Configure Features',
              icon: Pencil,
              dialog: {
                title: 'Configure Included Features',
                description: `Choose which features from ${row.original.appCode} are included in this plan.`,
                content: (close) => (
                  <EditPlanAppForm
                    planId={planId}
                    appCode={row.original.appCode}
                    currentFeatureCodes={row.original.includedFeatureCodes}
                    onSuccess={close}
                    onCancel={close}
                  />
                ),
              },
            },
            {
              type: 'item' as const,
              id: 'remove',
              label: 'Remove',
              icon: Trash2,
              variant: 'destructive',
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

// Apps tab — data table of apps assigned to a plan with assign + configure + remove
export const AppsTab = ({ planId }: { planId: string }) => {
  const queryClient = useQueryClient();
  const { data: response, isLoading } = usePlanAppsTable(planId);
  const confirm = useConfirm();
  const assignDialog = useDialog();
  const removeMutation = useRemovePlanApp();

  async function handleRemove(row: PlanAppTableRow) {
    const confirmed = await confirm({
      title: `Remove ${row.appCode}?`,
      description: 'This app will be unassigned from the plan.',
      confirmLabel: 'Remove',
      variant: 'destructive',
    });
    if (confirmed) removeMutation.mutate({ planId, appId: row.appCode });
  }

  const { table } = useDataTable({
    columns: getColumns({ planId, onRemove: handleRemove }),
    slug: `plan-apps-${planId}`,
    label: 'app',
    serverState: response,
    enableRowSelection: false,
    enableSorting: true,
    enableMultiSort: false,
    onStatePush: () => queryClient.invalidateQueries({ queryKey: PLAN_APPS_TABLE_KEY(planId) }),
  });

  return (
    <div className="flex flex-col gap-4 pt-4">
      <DataTable
        table={table}
        minHeight="400px"
        isLoading={isLoading}
        searchConfig={{
          columns: [{ id: 'appCode', label: 'App Code' }],
          searchAll: true,
        }}
        toolbarActions={{
          actions: (
            <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={assignDialog.open}>
              Assign App
            </Button>
          ),
        }}
        emptyStateConfig={{
          icon: AppWindow,
          title: 'No apps assigned',
          description: 'Assign apps to include them in this plan.',
          action: (
            <Button size="sm" onClick={assignDialog.open}>
              <Plus className="size-4" />
              Assign App
            </Button>
          ),
        }}
      />

      <Dialog
        open={assignDialog.isOpen}
        onOpenChange={(v) => {
          if (!v) assignDialog.close();
        }}
        title="Assign App"
        description="Select an app to assign to this plan."
        content={(close) => (
          <AssignPlanAppForm planId={planId} onSuccess={close} onCancel={close} />
        )}
      />
    </div>
  );
};
