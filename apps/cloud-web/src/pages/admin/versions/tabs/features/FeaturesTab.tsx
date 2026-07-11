import { useFeatures } from '@hooks/admin/versions/features';
import { FEATURES_QUERY_KEY } from '@hooks/admin/versions/features/useFeatures';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { type ColumnDef, DataTable, getSelectionColumn, RowActions, useDataTable } from '@vritti/quantum-ui/DataTable';

import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useDialog } from '@vritti/quantum-ui/hooks';
import { BusinessFilter } from '@vritti/quantum-ui/selects/business';
import { buildSlug } from '@vritti/quantum-ui/slug';
import { Blocks, Eye, Layers, Plus } from 'lucide-react';
import { DynamicIcon } from 'lucide-react/dynamic';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVersionContext } from '@/context/VersionScopeContext';
import { type Feature, SCOPE_TYPE_LABELS, SITE_TYPE_LABELS, SITE_TYPE_VALUES } from '@/schemas/admin/features';
import { AddFeatureForm } from '../features/forms/AddFeatureForm';
import { ChangeFeaturesScopeForm } from '../features/forms/ChangeFeaturesScopeForm';

const TABLE_SLUG = 'features';

export const FeaturesTab = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { versionId } = useVersionContext();
  const { data: response, isLoading } = useFeatures(versionId);
  const addDialog = useDialog();
  const scopeDialog = useDialog();
  const [scopeFeatureIds, setScopeFeatureIds] = useState<string[]>([]);

  const { table } = useDataTable({
    columns: getColumns({
      onView: (feature) => navigate(`feat-${buildSlug(feature.name, feature.id)}`, { relative: 'path' }),
    }),
    slug: TABLE_SLUG,
    label: 'feature',
    serverState: response,
    enableRowSelection: true,
    enableSorting: true,
    enableMultiSort: false,
    onStatePush: () => queryClient.invalidateQueries({ queryKey: FEATURES_QUERY_KEY(versionId) }),
  });

  return (
    <div>
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
        filters={[<BusinessFilter key="businessId" name="businessId" params={{ inVersion: versionId }} />]}
        importExport={{
          columns: [
            { key: 'code', label: 'Code' },
            { key: 'name', label: 'Name' },
            { key: 'lucideIcon', label: 'Icon' },
            { key: 'description', label: 'Description' },
            { key: 'permissions', label: 'Permissions' },
          ],
          sampleData: [
            {
              code: 'products',
              name: 'Products',
              lucideIcon: 'package',
              description: 'Product catalog management',
              permissions: 'VIEW,CREATE,EDIT,DELETE',
            },
            {
              code: 'orders',
              name: 'Orders',
              lucideIcon: 'clipboard-list',
              description: 'Order management',
              permissions: 'VIEW,CREATE',
            },
          ],
          importEndpoint: `admin-api/versions/${versionId}/features/import`,
          exportEndpoint: `admin-api/versions/${versionId}/features/export`,
          transformExportRow: (row) => ({
            code: row.code,
            name: row.name,
            lucideIcon: row.lucideIcon,
            description: row.description ?? '',
            permissions: row.permissions.join(','),
          }),
          filename: 'features',
          onSuccess: () => queryClient.invalidateQueries({ queryKey: FEATURES_QUERY_KEY(versionId) }),
        }}
        selectActions={(rows) => (
          <Button
            variant="outline"
            size="sm"
            startAdornment={<Layers className="size-4" />}
            onClick={() => {
              setScopeFeatureIds(rows.map((r) => r.original.id));
              scopeDialog.open();
            }}
          >
            Change scope of {rows.length}
          </Button>
        )}
        toolbarActions={{
          actions: (
            <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={addDialog.open}>
              Add Feature
            </Button>
          ),
        }}
        mode="tab"
        emptyStateConfig={{
          icon: Blocks,
          title: 'No features found',
          description: 'Add your first feature to define a sidebar item / screen.',
          action: (
            <Button size="sm" onClick={addDialog.open}>
              <Plus className="size-4" />
              Add Feature
            </Button>
          ),
        }}
      />

      <Dialog
        handle={addDialog}
        icon={Blocks}
        title="Add Feature"
        description="Define a new feature (sidebar item / screen)."
        content={(close) => <AddFeatureForm onSuccess={close} onCancel={close} />}
      />

      <Dialog
        handle={scopeDialog}
        icon={Layers}
        title="Change Feature Scope"
        description={`Set the scope for ${scopeFeatureIds.length} selected ${scopeFeatureIds.length === 1 ? 'feature' : 'features'}. Grants on role templates of a different scope will be removed.`}
        content={(close) => (
          <ChangeFeaturesScopeForm
            featureIds={scopeFeatureIds}
            onSuccess={() => {
              table.resetRowSelection();
              close();
            }}
            onCancel={close}
          />
        )}
      />
    </div>
  );
};

interface ColumnActions {
  onView: (feature: Feature) => void;
}

function getColumns({ onView }: ColumnActions): ColumnDef<Feature, unknown>[] {
  return [
    getSelectionColumn<Feature>(),
    {
      accessorKey: 'lucideIcon',
      header: '',
      cell: ({ row }) => <DynamicIcon name={row.original.lucideIcon} className="size-4 text-muted-foreground" />,
      enableSorting: false,
      enableHiding: false,
      size: 40,
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
      accessorKey: 'name',
      header: 'Name',
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
      accessorKey: 'applicableSiteTypes',
      header: 'Site Types',
      cell: ({ row }) => {
        if (row.original.scope !== 'SITE') return <span className="text-muted-foreground">—</span>;
        const applicableSiteTypes = row.original.applicableSiteTypes ?? [];
        return (
          <div className="flex flex-wrap gap-1">
            {SITE_TYPE_VALUES.filter((t) => applicableSiteTypes.includes(t)).map((t) => (
              <Badge key={t} variant="secondary" className="text-xs font-medium">
                {SITE_TYPE_LABELS[t]}
              </Badge>
            ))}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: 'permissions',
      header: 'Permissions',
      cell: ({ row }) => (
        <Badge variant={row.original.permissions.length === 0 ? 'destructive' : 'secondary'}>
          {row.original.permissions.length} permissions
        </Badge>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'platforms',
      header: 'Platforms',
      cell: ({ row }) => {
        const platforms = row.original.platforms;
        if (!platforms.length) return <span className="text-muted-foreground">—</span>;
        return (
          <div className="flex flex-wrap justify-center gap-1">
            {platforms.map((p) => (
              <Badge key={p} variant="outline" className="text-xs font-medium">
                {p}
              </Badge>
            ))}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: 'businessCount',
      header: 'Businesses',
      cell: ({ row }) => (
        <Badge variant={row.original.businessCount === 0 ? 'destructive' : 'secondary'}>
          {row.original.businessCount} businesses
        </Badge>
      ),
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
