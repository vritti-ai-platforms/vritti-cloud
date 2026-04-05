import { useCreateBusinessUnit, useOrgBusinessUnits } from '@hooks/cloud/org-business-units';
import { Button } from '@vritti/quantum-ui/Button';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { HierarchyGraph } from '@vritti/quantum-ui/HierarchyGraph';
import { useDialog } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';
import { Building2, Plus } from 'lucide-react';
import { useCallback, useMemo, useRef } from 'react';
import { buildSlug } from '@vritti/quantum-ui/slug';
import { useNavigate, useParams } from 'react-router-dom';
import type { BusinessUnit, CreateBusinessUnitData } from '@/schemas/cloud/org-business-units';
import { BUNodeCard } from './components/BUNodeCard';
import { BusinessUnitForm } from './components/BusinessUnitForm';

export const OrgBusinessUnitsPage = () => {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const orgId = orgSlug?.replace(/^org-/, '').split('~').pop() || '';
  const navigate = useNavigate();

  const { data: response, isLoading } = useOrgBusinessUnits(orgId);
  const businessUnits = response?.result ?? [];

  const createDialog = useDialog();
  const parentIdRef = useRef<string | undefined>(undefined);
  const createMutation = useCreateBusinessUnit();

  // Creates a new business unit
  function handleCreate(data: CreateBusinessUnitData) {
    const cleaned = { ...data, parentId: data.parentId || undefined };
    createMutation.mutate(
      { orgId, data: cleaned },
      { onSuccess: () => createDialog.close() },
    );
  }

  // Opens the create dialog with optional parent pre-selected
  const handleAddChild = useCallback(
    (parentId: string) => {
      parentIdRef.current = parentId;
      createDialog.open();
    },
    [createDialog],
  );

  // Navigates to the BU view page
  const handleNodeClick = useCallback(
    (item: BusinessUnit) => {
      navigate(`bu-${buildSlug(item.name, item.id)}`);
    },
    [navigate],
  );

  // Compute child counts and inject callbacks
  const itemsWithCallbacks = useMemo(() => {
    const childCounts = new Map<string, number>();
    for (const bu of businessUnits) {
      if (bu.parentId) {
        childCounts.set(bu.parentId, (childCounts.get(bu.parentId) ?? 0) + 1);
      }
    }
    return businessUnits.map((bu) => ({
      ...bu,
      childCount: childCounts.get(bu.id) ?? 0,
      onAddChild: handleAddChild,
    }));
  }, [businessUnits, handleAddChild]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Business Units"
        description="Manage the organizational structure and hierarchy"
        actions={
          <Button
            startAdornment={<Plus className="size-4" />}
            size="sm"
            onClick={() => {
              parentIdRef.current = undefined;
              createDialog.open();
            }}
          >
            Create Business Unit
          </Button>
        }
      />

      {isLoading && <Skeleton className="h-[600px] w-full rounded-lg" />}

      {!isLoading && businessUnits.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Building2 className="size-10 text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-foreground">No business units</p>
          <p className="text-xs text-muted-foreground mt-1">
            Create your first business unit to define your organization's structure.
          </p>
          <Button
            startAdornment={<Plus className="size-4" />}
            size="sm"
            className="mt-4"
            onClick={createDialog.open}
          >
            Create Business Unit
          </Button>
        </div>
      )}

      {!isLoading && businessUnits.length > 0 && (
        <HierarchyGraph
          items={itemsWithCallbacks}
          nodeComponent={BUNodeCard}
          nodeWidth={260}
          nodeHeight={110}
          onNodeClick={handleNodeClick}
        />
      )}

      {/* Create dialog */}
      <Dialog
        handle={createDialog}
        title="Create Business Unit"
        description="Define a new business unit in your organization's hierarchy."
        className="sm:max-w-2xl"
        content={(close) => (
          <BusinessUnitForm
            existingUnits={businessUnits}
            defaultParentId={parentIdRef.current}
            onSubmit={handleCreate}
            onCancel={close}
            isPending={createMutation.isPending}
          />
        )}
      />
    </div>
  );
};
