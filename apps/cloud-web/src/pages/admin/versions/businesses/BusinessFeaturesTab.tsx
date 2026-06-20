import {
  BUSINESS_FEATURES_TABLE_KEY,
  useBusinessFeaturePermissions,
  useBusinessFeatures,
  useSetBusinessFeatureApps,
} from '@hooks/admin/business-features';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { type ColumnDef, DataTable, RowActions, useDataTable } from '@vritti/quantum-ui/DataTable';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useConfirm, useDialog } from '@vritti/quantum-ui/hooks';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';
import { AppFilter } from '@vritti/quantum-ui/selects/app';
import { Blocks, Eye, KeyRound, Pencil, Plus, Trash2 } from 'lucide-react';
import { DynamicIcon, type IconName } from 'lucide-react/dynamic';
import { useState } from 'react';
import type { BusinessFeature } from '@/schemas/admin/business-features';
import { AddBusinessFeatureForm } from './forms/AddBusinessFeatureForm';
import { EditBusinessFeatureAppsForm } from './forms/EditBusinessFeatureAppsForm';

interface BusinessFeaturesTabProps {
  versionId: string;
  businessId: string;
}

interface ColumnActions {
  versionId: string;
  businessId: string;
  onView: (feature: BusinessFeature) => void;
  onRemove: (feature: BusinessFeature) => void;
}

function getColumns({ versionId, businessId, onView, onRemove }: ColumnActions): ColumnDef<BusinessFeature, unknown>[] {
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
      id: 'apps',
      header: 'Apps',
      cell: ({ row }) => (
        <div className="flex flex-wrap items-center justify-center gap-1">
          {row.original.apps.slice(0, 2).map((app) => (
            <Badge key={app.id} variant="secondary" className="text-[10px]">
              {app.name}
            </Badge>
          ))}
          {row.original.apps.length > 2 && (
            <Badge variant="outline" className="text-[10px]">
              +{row.original.apps.length - 2}
            </Badge>
          )}
        </div>
      ),
      enableSorting: false,
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
              label: 'Edit apps',
              dialog: {
                title: `Edit apps — ${row.original.name}`,
                description: 'Choose which apps this feature belongs to in this business.',
                content: (close) => (
                  <EditBusinessFeatureAppsForm
                    versionId={versionId}
                    businessId={businessId}
                    feature={row.original}
                    onSuccess={close}
                    onCancel={close}
                  />
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

export const BusinessFeaturesTab = ({ versionId, businessId }: BusinessFeaturesTabProps) => {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const { data: response, isLoading } = useBusinessFeatures(versionId, businessId);
  const addDialog = useDialog();
  const permissionsDialog = useDialog();
  const [selected, setSelected] = useState<BusinessFeature | null>(null);

  const removeMutation = useSetBusinessFeatureApps();
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
    if (confirmed) removeMutation.mutate({ versionId, businessId, featureId: feature.id, data: { appIds: [] } });
  }

  const { table } = useDataTable({
    columns: getColumns({ versionId, businessId, onView: handleView, onRemove: handleRemove }),
    slug: `business-features-${businessId}`,
    label: 'feature',
    serverState: response,
    enableRowSelection: false,
    enableSorting: true,
    enableMultiSort: false,
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
        filters={[<AppFilter key="appId" name="appId" params={{ versionId, businessId }} />]}
        toolbarActions={{
          actions: (
            <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={addDialog.open}>
              Add Feature
            </Button>
          ),
        }}
        emptyStateConfig={{
          icon: Blocks,
          title: 'No features assigned',
          description: 'Add a feature and assign it to this business’s apps.',
          action: (
            <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={addDialog.open}>
              Add Feature
            </Button>
          ),
        }}
      />

      <Dialog
        handle={addDialog}
        icon={Blocks}
        title="Add Feature"
        description="Assign a feature to one or more of this business’s apps."
        content={(close) => (
          <AddBusinessFeatureForm versionId={versionId} businessId={businessId} onSuccess={close} onCancel={close} />
        )}
      />

      <Dialog
        handle={permissionsDialog}
        icon={KeyRound}
        title={selected ? `${selected.name} permissions` : 'Permissions'}
        description="Permissions available to this business for the feature."
        content={() => (
          <div className="flex flex-col gap-2 px-6 pb-2 min-h-80">
            {permissionsLoading ? (
              [1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full rounded-md" />)
            ) : permissions.length ? (
              permissions.map((permission) => (
                <div key={permission.id} className="flex items-center gap-3 rounded-md border px-3 py-2">
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <span className="text-sm font-medium truncate">{permission.label}</span>
                    <span className="text-[11px] font-mono text-muted-foreground truncate">{permission.code}</span>
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
