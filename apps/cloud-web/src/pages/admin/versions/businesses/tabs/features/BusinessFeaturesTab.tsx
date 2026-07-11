import {
  BUSINESS_FEATURES_TABLE_KEY,
  useBusinessFeaturePermissions,
  useBusinessFeatures,
  useRemoveBusinessFeatures,
  useSetBusinessFeatureApp,
} from '@hooks/admin/versions/businesses/features';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { type ColumnDef, DataTable, getSelectionColumn, RowActions, useDataTable } from '@vritti/quantum-ui/DataTable';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useConfirm, useDialog } from '@vritti/quantum-ui/hooks';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';
import { AppFilter } from '@vritti/quantum-ui/selects/app';
import { Blocks, Eye, KeyRound, Pencil, Plus, Trash2 } from 'lucide-react';
import { DynamicIcon, type IconName } from 'lucide-react/dynamic';
import { useState } from 'react';
import { useVersionContext } from '@/context/VersionScopeContext';
import type { BusinessFeature } from '@/schemas/admin/business-features';
import { SCOPE_TYPE_LABELS } from '@/schemas/admin/features';
import { AddBusinessFeatureForm } from './forms/AddBusinessFeatureForm';
import { EditBusinessFeatureAppForm } from './forms/EditBusinessFeatureAppForm';

interface ColumnActions {
  onView: (feature: BusinessFeature) => void;
  onRemove: (feature: BusinessFeature) => void;
}

function getColumns({ onView, onRemove }: ColumnActions): ColumnDef<BusinessFeature, unknown>[] {
  return [
    getSelectionColumn<BusinessFeature>(),
    {
      accessorKey: 'lucideIcon',
      header: '',
      cell: ({ row }) => (
        <DynamicIcon name={row.original.lucideIcon as IconName} className="size-4 text-muted-foreground" />
      ),
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
        <Badge variant="outline" className="font-mono text-xs font-medium">
          {row.original.code}
        </Badge>
      ),
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
      id: 'app',
      accessorFn: (row) => row.app?.name ?? '',
      header: 'App',
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          {row.original.app ? (
            <Badge variant="secondary" className="text-xs">
              {row.original.app.name}
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'permissionCount',
      header: 'Permissions',
      cell: ({ row }) => (
        <Badge variant={row.original.permissionCount === 0 ? 'destructive' : 'secondary'} className="tabular-nums">
          {row.original.permissionCount}
        </Badge>
      ),
      enableSorting: false,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <RowActions
          actions={[
            { id: 'view', icon: Eye, label: 'View permissions', onClick: () => onView(row.original) },
            {
              id: 'edit',
              icon: Pencil,
              label: 'Edit app',
              dialog: {
                title: `Edit app — ${row.original.name}`,
                description: 'Choose which app this feature belongs to in this business.',
                content: (close) => (
                  <EditBusinessFeatureAppForm feature={row.original} onSuccess={close} onCancel={close} />
                ),
              },
            },
            {
              id: 'remove',
              icon: Trash2,
              label: 'Remove from business',
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

export const BusinessFeaturesTab = () => {
  const { versionId, businessId } = useVersionContext();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const { data: response, isLoading } = useBusinessFeatures(versionId, businessId);
  const addDialog = useDialog();
  const permissionsDialog = useDialog();
  const [selected, setSelected] = useState<BusinessFeature | null>(null);

  const removeMutation = useSetBusinessFeatureApp();
  const bulkRemoveMutation = useRemoveBusinessFeatures();
  const { data: permissions = [], isLoading: permissionsLoading } = useBusinessFeaturePermissions(
    versionId,
    businessId,
    permissionsDialog.isOpen ? (selected?.id ?? null) : null,
  );

  // Opens the permissions dialog for a feature
  function handleView(feature: BusinessFeature) {
    setSelected(feature);
    permissionsDialog.open();
  }

  // Prompts then removes a feature from all of this business's apps
  async function handleRemove(feature: BusinessFeature) {
    const confirmed = await confirm({
      title: `Remove ${feature.name}?`,
      description: `${feature.name} will be removed from all apps in this business. This does not delete the feature.`,
      confirmLabel: 'Remove',
      variant: 'destructive',
    });
    if (confirmed) removeMutation.mutate({ versionId, businessId, featureId: feature.id, data: { appId: null } });
  }

  // Prompts then removes all selected features from this business in a single request
  async function handleBulkRemove(featureIds: string[]) {
    const confirmed = await confirm({
      title: `Remove ${featureIds.length} feature${featureIds.length === 1 ? '' : 's'}?`,
      description:
        'The selected features will be removed from this business’s apps. This does not delete the features.',
      confirmLabel: 'Remove',
      variant: 'destructive',
    });
    if (!confirmed) return;
    bulkRemoveMutation.mutate({ versionId, businessId, featureIds }, { onSuccess: () => table.resetRowSelection() });
  }

  const { table } = useDataTable({
    columns: getColumns({ onView: handleView, onRemove: handleRemove }),
    slug: `business-features-${businessId}`,
    label: 'feature',
    serverState: response,
    enableRowSelection: true,
    enableSorting: true,
    enableMultiSort: true,
    onStatePush: () => queryClient.invalidateQueries({ queryKey: BUSINESS_FEATURES_TABLE_KEY(versionId, businessId) }),
  });

  return (
    <>
      <DataTable
        table={table}
        isLoading={isLoading}
        mode="tab"
        searchConfig={{
          columns: [
            { id: 'name', label: 'Feature' },
            { id: 'code', label: 'Code' },
          ],
          searchAll: true,
        }}
        filters={[<AppFilter key="appId" name="appId" params={{ versionId, businessId }} multiple />]}
        selectActions={(rows) => (
          <Button
            variant="destructive"
            size="sm"
            startAdornment={<Trash2 className="size-4" />}
            onClick={() => handleBulkRemove(rows.map((r) => r.original.id))}
          >
            Remove {rows.length} from business
          </Button>
        )}
        toolbarActions={{
          actions: (
            <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={addDialog.open}>
              Add Features
            </Button>
          ),
        }}
        emptyStateConfig={{
          icon: Blocks,
          title: 'No features assigned',
          description: 'Add a feature and assign it to this business’s apps.',
          action: (
            <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={addDialog.open}>
              Add Features
            </Button>
          ),
        }}
      />

      <Dialog
        handle={addDialog}
        icon={Blocks}
        title="Add Features"
        description="Select features to add to this business under an app."
        content={(close) => <AddBusinessFeatureForm onSuccess={close} onCancel={close} />}
      />

      <Dialog
        handle={permissionsDialog}
        icon={KeyRound}
        title={selected ? `${selected.name} permissions` : 'Permissions'}
        description="Permissions available to this business for the feature."
        content={() => (
          <div className="flex flex-col gap-2 px-6 py-2">
            {permissionsLoading ? (
              [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full rounded-md" />)
            ) : permissions.length ? (
              permissions.map((permission) => (
                <div key={permission.id} className="flex items-center gap-3 rounded-md border px-3 py-2">
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <span className="text-sm font-medium truncate">{permission.label}</span>
                    <span className="text-xs font-mono text-muted-foreground truncate">{permission.code}</span>
                  </div>
                  {permission.isGlobal ? (
                    <Badge variant="secondary">Global</Badge>
                  ) : (
                    <Badge variant="outline">Business Specific</Badge>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">No permissions for this feature.</p>
            )}
          </div>
        )}
      />
    </>
  );
};
