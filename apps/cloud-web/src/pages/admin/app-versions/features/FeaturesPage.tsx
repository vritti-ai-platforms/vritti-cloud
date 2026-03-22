import { useDeleteFeature, useFeatures } from '@hooks/admin/features';
import { FEATURES_QUERY_KEY } from '@hooks/admin/features/useFeatures';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { type ColumnDef, DataTable, useDataTable } from '@vritti/quantum-ui/DataTable';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useConfirm, useDialog } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { buildSlug } from '@vritti/quantum-ui/utils/slug';
import { Blocks, Eye, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVersionContext } from '@/hooks/admin/app-versions/useVersionContext';
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
      onView: (feature) => navigate(buildSlug(feature.name, feature.id)),
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
        open={addDialog.isOpen}
        onOpenChange={(v) => {
          if (!v) addDialog.close();
        }}
        title="Add Feature"
        description="Define a new feature (sidebar item / screen)."
        content={(close) => <AddFeatureForm onSuccess={close} onCancel={close} />}
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
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="size-7" onClick={() => onView(row.original)}>
            <Eye className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-destructive hover:text-destructive"
            disabled={!row.original.canDelete}
            onClick={() => onDelete(row.original)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
