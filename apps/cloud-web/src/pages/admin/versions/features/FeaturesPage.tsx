import { useBulkCreateFeatures, useDeleteFeature, useFeatures, useValidateFeatureImport } from '@hooks/admin/features';
import { FEATURES_QUERY_KEY } from '@hooks/admin/features/useFeatures';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { type ColumnDef, DataTable, RowActions, useDataTable } from '@vritti/quantum-ui/DataTable';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useConfirm, useDialog } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { buildSlug } from '@vritti/quantum-ui/utils/slug';
import { Blocks, Eye, Plus, Trash2, Upload } from 'lucide-react';
import { DynamicIcon, type IconName } from 'lucide-react/dynamic';
import { useNavigate } from 'react-router-dom';
import { ImportDialog } from '@/components/ImportDialog';
import { useVersionContext } from '@/hooks/admin/versions/useVersionContext';
import type { Feature } from '@/schemas/admin/features';
import { AddFeatureForm } from './forms/AddFeatureForm';

const TABLE_SLUG = 'features';

export const FeaturesPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { versionId } = useVersionContext();
  const { data: response, isLoading } = useFeatures(versionId);
  const confirm = useConfirm();
  const addDialog = useDialog();
  const validateImportMutation = useValidateFeatureImport(versionId);
  const bulkCreateMutation = useBulkCreateFeatures(versionId);
  const importDialog = useDialog({
    onClose: () => {
      validateImportMutation.reset();
      bulkCreateMutation.reset();
    },
  });

  const deleteMutation = useDeleteFeature(versionId);

  async function handleDelete(feature: Feature) {
    const confirmed = await confirm({
      title: `Delete ${feature.name}?`,
      description: `${feature.name} will be permanently removed. This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (confirmed) deleteMutation.mutate(feature.id);
  }

  const { table } = useDataTable({
    columns: getColumns({
      onView: (feature) => navigate(`feat-${buildSlug(feature.name, feature.id)}`),
      onDelete: handleDelete,
    }),
    slug: TABLE_SLUG,
    label: 'feature',
    serverState: response,
    enableRowSelection: false,
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
        toolbarActions={{
          actions: (
            <div className="flex items-center gap-2">
              <Button variant="outline" startAdornment={<Upload className="size-4" />} size="sm" onClick={importDialog.open}>
                Import
              </Button>
              <Button startAdornment={<Plus className="size-4" />} size="sm" onClick={addDialog.open}>
                Add Feature
              </Button>
            </div>
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

      <ImportDialog
        handle={importDialog}
        title="Import Features"
        description="Upload a CSV or Excel file with feature data."
        columns={[
          { key: 'code', label: 'Code' },
          { key: 'name', label: 'Name' },
          { key: 'icon', label: 'Icon' },
          { key: 'description', label: 'Description' },
        ]}
        validateMutation={validateImportMutation}
        importMutation={bulkCreateMutation}
        sampleData={[
          { code: 'products', name: 'Products', icon: 'package', description: 'Product catalog management' },
          { code: 'orders', name: 'Orders', icon: 'clipboard-list', description: 'Order management' },
        ]}
      />
    </div>
  );
};

interface ColumnActions {
  onView: (feature: Feature) => void;
  onDelete: (feature: Feature) => void;
}

function getColumns({ onView, onDelete }: ColumnActions): ColumnDef<Feature, unknown>[] {
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
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <RowActions
          actions={[
            { id: 'view', icon: Eye, label: 'View', onClick: () => onView(row.original) },
            {
              id: 'delete',
              icon: Trash2,
              label: 'Delete',
              variant: 'destructive',
              disabled: !row.original.canDelete,
              onClick: () => onDelete(row.original),
            },
          ]}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
