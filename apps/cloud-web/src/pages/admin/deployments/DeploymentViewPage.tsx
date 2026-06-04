import {
  useAssignDeploymentPlan,
  useDeleteDeployment,
  useDeployment,
  useDeploymentPlanAssignments,
  useRemoveDeploymentPlan,
} from '@hooks/admin/deployments';
import { cn } from '@vritti/quantum-ui';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@vritti/quantum-ui/Card';
import { DangerZone } from '@vritti/quantum-ui/DangerZone';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useConfirm, useDialog, useSlugParams } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Spinner } from '@vritti/quantum-ui/Spinner';
import { Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { DeploymentPlanAssignment, DeploymentPlanAssignmentBusiness } from '@/schemas/admin/deployments';
import { EditDeploymentForm } from './forms/EditDeploymentForm';

export const DeploymentViewPage = () => {
  const { id } = useSlugParams('deploymentSlug');
  const navigate = useNavigate();

  const editDialog = useDialog();
  const confirm = useConfirm();

  const { data: deployment } = useDeployment(id ?? '');
  const { data: planAssignments = [], isLoading: plansLoading } = useDeploymentPlanAssignments(id ?? '');

  const assignMutation = useAssignDeploymentPlan();
  const removeMutation = useRemoveDeploymentPlan();

  const deleteMutation = useDeleteDeployment({
    onSuccess: () => navigate('/deployments'),
  });

  const handleChipToggle = (planId: string, businessId: string) => {
    const plan = planAssignments.find((p) => p.planId === planId);
    const isAssigned = plan?.businesses.find((b) => b.businessId === businessId)?.isAssigned ?? false;
    if (isAssigned) {
      removeMutation.mutate({ id: id ?? '', data: { planId, businessId } });
    } else {
      assignMutation.mutate({ id: id ?? '', data: { planId, businessId } });
    }
  };

  // Prompt confirmation then delete
  const handleDelete = async () => {
    if (!id) return;
    const confirmed = await confirm({
      title: `Delete ${deployment.name}?`,
      description: 'This action cannot be undone. All associated plan assignments will be removed.',
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (confirmed) deleteMutation.mutate(id);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={deployment.name}
        description={deployment.type}
        actions={
          <Button variant="outline" size="sm" onClick={editDialog.open}>
            Edit
          </Button>
        }
      />

      {/* Plans & Prices section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Plans &amp; Prices</h2>
          {planAssignments.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {planAssignments.length} plan{planAssignments.length !== 1 ? 's' : ''} available
            </span>
          )}
        </div>

        {plansLoading && (
          <div className="flex items-center justify-center py-8">
            <Spinner className="size-5 text-primary" />
          </div>
        )}

        {!plansLoading && planAssignments.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Tag className="size-8 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground">No plans available</p>
              <p className="text-xs text-muted-foreground mt-1">
                No pricing configured for this region and cloud provider.
              </p>
            </CardContent>
          </Card>
        )}

        {!plansLoading && planAssignments.length > 0 && (
          <div className="flex flex-col gap-4">
            {planAssignments.map((plan: DeploymentPlanAssignment) => (
              <PlanCard key={plan.planId} plan={plan} onToggle={handleChipToggle} />
            ))}
          </div>
        )}
      </div>

      <DangerZone
        title="Delete this deployment"
        description="This action cannot be undone. All associated plan assignments will be removed."
        buttonText="Delete Deployment"
        onClick={handleDelete}
        disabled={!!deployment.organizationCount}
        warning={
          deployment.organizationCount
            ? `This deployment is used by ${deployment.organizationCount} organization${deployment.organizationCount !== 1 ? 's' : ''}. Remove all associated organizations before deleting.`
            : undefined
        }
      />

      {/* Edit dialog */}
      <Dialog
        handle={editDialog}
        title="Edit Deployment"
        description="Update the details for this deployment."
        content={(close) => <EditDeploymentForm deployment={deployment} onSuccess={close} onCancel={close} />}
      />
    </div>
  );
};

interface PlanCardProps {
  plan: DeploymentPlanAssignment;
  onToggle: (planId: string, businessId: string) => void;
}

const PlanCard = ({ plan, onToggle }: PlanCardProps) => (
  <Card className="flex flex-col">
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between gap-2">
        <CardTitle className="text-base leading-tight">{plan.planName}</CardTitle>
        <Badge variant="secondary" className="shrink-0 font-mono text-xs">
          {plan.planCode}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">
        {plan.businesses.length} business{plan.businesses.length !== 1 ? 'es' : ''}
      </p>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="flex flex-wrap gap-2">
        {plan.businesses.map((business: DeploymentPlanAssignmentBusiness) => (
          <Button
            key={business.businessId}
            variant="ghost"
            size="sm"
            onClick={() => onToggle(plan.planId, business.businessId)}
            className={cn(
              'h-auto rounded-full border px-3 py-1.5 text-sm transition-colors',
              business.isAssigned
                ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
                : 'border-border bg-muted/30 text-foreground hover:bg-muted hover:border-primary/40',
            )}
          >
            <span>{business.businessName}</span>
            {business.price ? (
              <span
                className={cn('font-semibold', business.isAssigned ? 'text-primary-foreground/80' : 'text-primary')}
              >
                · {business.currency} {business.price}
              </span>
            ) : (
              <span className={business.isAssigned ? 'text-primary-foreground/60' : 'text-muted-foreground'}>
                · No price
              </span>
            )}
          </Button>
        ))}
      </div>
    </CardContent>
  </Card>
);
