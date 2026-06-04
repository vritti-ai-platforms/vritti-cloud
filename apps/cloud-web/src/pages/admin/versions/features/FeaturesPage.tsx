import { useFeatures } from '@hooks/admin/features';
import { FEATURES_QUERY_KEY } from '@hooks/admin/features/useFeatures';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { type ColumnDef, DataTable, getSelectionColumn, RowActions, useDataTable } from '@vritti/quantum-ui/DataTable';

import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useDialog } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { buildSlug } from '@vritti/quantum-ui/slug';
import { Blocks, Eye, Plus } from 'lucide-react';
import { DynamicIcon } from 'lucide-react/dynamic';
import { useNavigate } from 'react-router-dom';
import { useVersionContext } from '@/hooks/admin/versions/useVersionContext';
import type { Feature } from '@/schemas/admin/features';
import { AddFeatureForm } from './forms/AddFeatureForm';

const TABLE_SLUG = 'features';

export const FeaturesPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { versionId } = useVersionContext();
  const { data: response, isLoading } = useFeatures(versionId);
  const addDialog = useDialog();

  const { table } = useDataTable({
    columns: getColumns({
      onView: (feature) => navigate(`feat-${buildSlug(feature.name, feature.id)}`),
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
    <div className="flex flex-col gap-6">
      <PageHeader title="Features" description="Manage features — each feature represents a sidebar item / screen" />

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
        importExport={{
          columns: [
            { key: 'code', label: 'Code' },
            { key: 'name', label: 'Name' },
            { key: 'icon', label: 'Icon' },
            { key: 'description', label: 'Description' },
            { key: 'permissions', label: 'Permissions' },
          ],
          sampleData: [
            {
              code: 'products',
              name: 'Products',
              icon: 'package',
              description: 'Product catalog management',
              permissions: 'VIEW,CREATE,EDIT,DELETE',
            },
            {
              code: 'orders',
              name: 'Orders',
              icon: 'clipboard-list',
              description: 'Order management',
              permissions: 'VIEW,CREATE',
            },
          ],
          importEndpoint: `admin-api/versions/${versionId}/features/import`,
          exportEndpoint: `admin-api/versions/${versionId}/features/export`,
          transformExportRow: (row) => ({
            code: row.code,
            name: row.name,
            icon: row.icon,
            description: row.description ?? '',
            permissions: row.permissions.join(','),
          }),
          filename: 'features',
          onSuccess: () => queryClient.invalidateQueries({ queryKey: FEATURES_QUERY_KEY(versionId) }),
        }}
        toolbarActions={{
          actions: (
            <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={addDialog.open}>
              Add Feature
            </Button>
          ),
        }}
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
        title="Add Feature"
        description="Define a new feature (sidebar item / screen)."
        content={(close) => <AddFeatureForm onSuccess={close} onCancel={close} />}
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
      accessorKey: 'icon',
      header: '',
      cell: ({ row }) => <DynamicIcon name={row.original.icon} className="size-4 text-muted-foreground" />,
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
    {
      accessorKey: 'permissions',
      header: 'Permissions',
      cell: ({ row }) => <Badge variant="secondary">{row.original.permissions.length} permissions</Badge>,
      enableSorting: false,
    },
    {
      accessorKey: 'platforms',
      header: 'Platforms',
      cell: ({ row }) => {
        const platforms = row.original.platforms;
        if (!platforms.length) return <span className="text-muted-foreground">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {platforms.map((p) => (
              <Badge key={p} variant="outline" className="text-[10px] font-medium">
                {p}
              </Badge>
            ))}
          </div>
        );
      },
      enableSorting: false,
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
        <RowActions actions={[{ id: 'view', icon: Eye, label: 'View', onClick: () => onView(row.original) }]} />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
