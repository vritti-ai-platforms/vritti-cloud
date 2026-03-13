import { useDeletePlan, usePlan, useUpdatePlan } from '@hooks/admin/plans';
import { pricesTableQueryKey, useDeletePrice, usePricesTable } from '@hooks/admin/prices';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vritti/quantum-ui/Card';
import { DangerZone } from '@vritti/quantum-ui/DangerZone';
import { type ColumnDef, DataTable, useDataTable } from '@vritti/quantum-ui/DataTable';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useConfirm, useDialog, useSlugParams } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { RichTextEditor } from '@vritti/quantum-ui/RichTextEditor';
import { Spinner } from '@vritti/quantum-ui/Spinner';
import { BadgeDollarSign, Building2, Cloud, Globe, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Plan } from '@/schemas/admin/plans';
import type { Price } from '@/schemas/admin/prices';
import { AddPriceForm } from './forms/AddPriceForm';
import { EditPlanForm } from './forms/EditPlanForm';
import { EditPriceForm } from './forms/EditPriceForm';

// Builds a specific warning listing what blocks deletion
function buildDeleteWarning(plan: Plan): string {
  const parts: string[] = [];
  if (plan.priceCount > 0) parts.push(`${plan.priceCount} price(s)`);
  if (plan.orgCount > 0) parts.push(`${plan.orgCount} organization(s)`);
  const summary = parts.length > 0 ? parts.join(' and ') : 'associated data';
  return `This plan has ${summary}. Remove all associations before deleting.`;
}

// Returns undefined if value is falsy or not valid JSON
function safeParse(value: string | null | undefined) {
  if (!value) return undefined;
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

export const PlanViewPage = () => {
  const { id } = useSlugParams();
  const navigate = useNavigate();

  const editDialog = useDialog();
  const confirm = useConfirm();

  const { data: plan, isLoading: planLoading } = usePlan(id);

  const deleteMutation = useDeletePlan({
    onSuccess: () => navigate('/plans'),
  });

  // Prompt confirmation then delete
  const handleDelete = async () => {
    if (!id) return;
    const confirmed = await confirm({
      title: `Delete ${plan?.name}?`,
      description: `${plan?.name} and all its associated data will be permanently removed. This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (confirmed) deleteMutation.mutate(id);
  };

  if (planLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <PageHeader
        title={plan.name}
        description={'Manage prices of this plan'}
        actions={
          <Button variant="outline" size="sm" onClick={editDialog.open}>
            Edit
          </Button>
        }
      />

      {/* Stat cards */}
      <PricingStats plan={plan} />

      {/* Plan content inline editor */}
      <PlanContentCard plan={plan} />

      {/* Pricing DataTable */}
      <PricingDataTable />

      <DangerZone
        title="Delete this plan"
        description="This action cannot be undone. All associated data will be permanently removed."
        buttonText="Delete Plan"
        onClick={handleDelete}
        disabled={!plan.canDelete}
        warning={!plan.canDelete ? buildDeleteWarning(plan) : undefined}
      />

      {/* Edit dialog */}
      <Dialog
        open={editDialog.isOpen}
        onOpenChange={(v) => {
          if (!v) editDialog.close();
        }}
        title="Edit Plan"
        description="Update the details for this subscription plan."
        content={(close) => <EditPlanForm plan={plan} onSuccess={close} onCancel={close} />}
      />
    </div>
  );
};

interface PlanContentCardProps {
  plan: Plan;
}

// Inline rich-text editor for plan content — avoids cramped dialog layout
const PlanContentCard = ({ plan }: PlanContentCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const contentRef = useRef<string | undefined>(plan.content ?? undefined);
  const contentInitialized = useRef(false);
  const [savedContent, setSavedContent] = useState<string | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateMutation = useUpdatePlan();

  // Use savedContent (optimistic) until query cache catches up
  const displayContent = savedContent ?? plan.content;

  // Clear optimistic override once query cache syncs
  useEffect(() => {
    if (savedContent && plan.content === savedContent) {
      setSavedContent(undefined);
    }
  }, [plan.content, savedContent]);

  // Save the current editor state
  const handleSave = () => {
    updateMutation.mutate(
      { id: plan.id, data: { content: contentRef.current } },
      {
        onSuccess: () => {
          setSavedContent(contentRef.current);
          setIsEditing(false);
        },
      },
    );
  };

  // Discard changes and return to view mode
  const handleCancel = () => {
    contentRef.current = displayContent ?? undefined;
    contentInitialized.current = false;
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Plan Content</CardTitle>
          <CardDescription>Shown to users when selecting a plan.</CardDescription>
        </div>
        {isEditing ? (
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={handleCancel} disabled={updateMutation.isPending}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} loadingText="Saving..." isLoading={updateMutation.isPending}>
              Save
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" className="shrink-0" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {mounted ? (
          <RichTextEditor
            key={isEditing ? 'edit' : 'view'}
            editorSerializedState={safeParse(displayContent)}
            onSerializedChange={(state) => {
              if (!contentInitialized.current) {
                contentInitialized.current = true;
                return;
              }
              contentRef.current = JSON.stringify(state);
            }}
            contentOnly={!isEditing}
            placeholder="Add plan features, inclusions, and details..."
            className="border-0 shadow-none bg-muted/30 min-h-[150px]"
          />
        ) : (
          !displayContent && (
            <p className="text-sm text-muted-foreground">No content yet. Click Edit to add plan features.</p>
          )
        )}
      </CardContent>
    </Card>
  );
};

interface PricingStatsProps {
  plan: Plan;
}

// Stat cards — counts come from the plan API response
const PricingStats = ({ plan }: PricingStatsProps) => (
  <div className="grid grid-cols-4 gap-4">
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
          <BadgeDollarSign className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Pricing Entries</p>
          <p className="text-2xl font-semibold">{plan.priceCount}</p>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
          <Globe className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Regions Covered</p>
          <p className="text-2xl font-semibold">{plan.regionCount}</p>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
          <Cloud className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Providers</p>
          <p className="text-2xl font-semibold">{plan.providerCount}</p>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
          <Building2 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Organizations</p>
          <p className="text-2xl font-semibold">{plan.orgCount}</p>
        </div>
      </CardContent>
    </Card>
  </div>
);

// DataTable only — self-contained with its own data fetching
const PricingDataTable = () => {
  const { id: planId } = useSlugParams();
  const queryClient = useQueryClient();
  const { data: response, isLoading } = usePricesTable(planId ?? '');

  // Memoize columns so planId closure is stable across renders
  const columns = useMemo<ColumnDef<Price, unknown>[]>(
    () => [
      {
        accessorKey: 'regionName',
        header: 'Region',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Globe className="size-4 text-muted-foreground" />
            <span>{row.original.regionName}</span>
            <Badge variant="outline" className="font-mono text-xs">
              {row.original.regionCode}
            </Badge>
          </div>
        ),
      },
      {
        accessorKey: 'providerName',
        header: 'Provider',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Cloud className="size-4 text-muted-foreground" />
            <span>{row.original.providerName}</span>
            <Badge variant="secondary" className="font-mono text-xs">
              {row.original.providerCode}
            </Badge>
          </div>
        ),
      },
      {
        accessorKey: 'price',
        header: 'Price',
        enableSorting: true,
      },
      {
        accessorKey: 'currency',
        header: 'Currency',
        cell: ({ row }) => <Badge variant="outline">{row.original.currency}</Badge>,
        enableSorting: false,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => <PriceActions price={row.original} planId={planId ?? ''} />,
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [planId],
  );

  const { table } = useDataTable({
    columns,
    slug: `prices-${planId}`,
    label: 'price',
    serverState: response,
    enableSorting: true,
    enableMultiSort: false,
    enableRowSelection: false,
    onStatePush: () => queryClient.invalidateQueries({ queryKey: pricesTableQueryKey(planId ?? '') }),
  });

  return (
    <DataTable
      table={table}
      minHeight="400px"
      isLoading={isLoading}
      searchConfig={{
        columns: [
          { id: 'regionName', label: 'Region' },
          { id: 'providerName', label: 'Provider' },
          { id: 'currency', label: 'Currency' },
        ],
        searchAll: true,
      }}
      toolbarActions={{
        actions: (
          <Dialog
            title="Add Price"
            description="Set a price for a specific industry, region, and cloud provider combination."
            anchor={(open) => (
              <Button size="sm" variant="default" startAdornment={<Plus className="size-4" />} onClick={open}>
                Add Price
              </Button>
            )}
            content={(close) => <AddPriceForm planId={planId ?? ''} onSuccess={close} onCancel={close} />}
          />
        ),
      }}
      emptyStateConfig={{
        title: 'No prices configured',
        description: 'Add a price for a specific industry, region, and cloud provider combination.',
      }}
    />
  );
};

interface PriceActionsProps {
  price: Price;
  planId: string;
}

const PriceActions = ({ price, planId }: PriceActionsProps) => {
  const confirm = useConfirm();
  const deleteMutation = useDeletePrice();
  const isDeleting = deleteMutation.isPending && deleteMutation.variables?.id === price.id;

  async function handleDelete() {
    const confirmed = await confirm({
      title: 'Delete price?',
      description: 'This price entry will be permanently removed. This action cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (confirmed) deleteMutation.mutate({ id: price.id, planId });
  }

  return (
    <div className="flex gap-1 justify-end">
      {/* Edit dialog */}
      <Dialog
        title="Edit Price"
        description="Update the price and currency for this combination."
        anchor={(open) => (
          <Button variant="ghost" size="icon" onClick={open} aria-label="Edit price">
            <Pencil className="size-4" />
          </Button>
        )}
        content={(close) => <EditPriceForm price={price} onSuccess={close} onCancel={close} />}
      />

      {/* Delete */}
      <Button
        variant="ghost"
        size="icon"
        className="text-destructive hover:text-destructive"
        disabled={isDeleting}
        onClick={handleDelete}
        aria-label="Delete price"
      >
        {isDeleting ? <Spinner className="size-4" /> : <Trash2 className="size-4" />}
      </Button>
    </div>
  );
};
