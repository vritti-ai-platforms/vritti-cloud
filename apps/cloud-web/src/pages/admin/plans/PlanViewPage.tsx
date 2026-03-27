import { useDeletePlan, usePlan } from '@hooks/admin/plans';
import { Button } from '@vritti/quantum-ui/Button';
import { DangerZone } from '@vritti/quantum-ui/DangerZone';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useConfirm, useDialog, useSlugParams } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Tabs } from '@vritti/quantum-ui/Tabs';
import { useNavigate } from 'react-router-dom';
import type { Plan } from '@/schemas/admin/plans';
import { EditPlanForm } from './forms/EditPlanForm';
import { AppsTab } from './tabs/AppsTab';
import { ContentTab } from './tabs/ContentTab';
import { PlanStats } from './tabs/PlanStats';
import { PricesTab } from './tabs/PricesTab';

// Builds a specific warning listing what blocks deletion
function buildDeleteWarning(plan: Plan): string {
  const parts: string[] = [];
  if (plan.priceCount > 0) parts.push(`${plan.priceCount} price(s)`);
  if (plan.orgCount > 0) parts.push(`${plan.orgCount} organization(s)`);
  const summary = parts.length > 0 ? parts.join(' and ') : 'associated data';
  return `This plan has ${summary}. Remove all associations before deleting.`;
}

export const PlanViewPage = () => {
  const { id } = useSlugParams();
  const navigate = useNavigate();

  const editDialog = useDialog();
  const confirm = useConfirm();

  const { data: plan } = usePlan(id);

  const deleteMutation = useDeletePlan({
    onSuccess: () => navigate('/plans'),
  });

  // Prompt confirmation then delete
  const handleDelete = async () => {
    if (!id) return;
    const confirmed = await confirm({
      title: `Delete ${plan.name}?`,
      description: `${plan.name} and all its associated data will be permanently removed. This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (confirmed) deleteMutation.mutate(id);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <PageHeader
        title={plan.name}
        description="Manage content, apps, and pricing for this plan"
        actions={
          <Button variant="outline" size="sm" onClick={editDialog.open}>
            Edit
          </Button>
        }
      />

      {/* Stats */}
      <PlanStats plan={plan} />

      {/* Tabs */}
      <Tabs
        defaultValue="content"
        contentClassName="min-h-[500px]"
        tabs={[
          { value: 'content', label: 'Content', content: <ContentTab plan={plan} /> },
          { value: 'apps', label: 'Apps', content: <AppsTab planId={id ?? ''} /> },
          { value: 'prices', label: 'Prices', content: <PricesTab /> },
        ]}
      />

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
