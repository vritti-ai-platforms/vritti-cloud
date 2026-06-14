import {
  useAssignDeploymentPlan,
  useDeleteDeployment,
  useDeployment,
  useDeploymentPlanAssignments,
  useRemoveDeploymentPlan,
} from '@hooks/admin/deployments';
import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@vritti/quantum-ui/Card';
import { DangerZone } from '@vritti/quantum-ui/DangerZone';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import { useConfirm, useDialog, useSlugParams } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Spinner } from '@vritti/quantum-ui/Spinner';
import { Server, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { DeploymentPlanAssignment } from '@/schemas/admin/deployments';
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

  const handleToggle = (plan: DeploymentPlanAssignment) => {
    const data = { planId: plan.planId };
    if (plan.isAssigned) {
      removeMutation.mutate({ id: id ?? '', data });
    } else {
      assignMutation.mutate({ id: id ?? '', data });
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

      {/* Provisioned plans section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Provisioned Plans</h2>
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
              <p className="text-xs text-muted-foreground mt-1">Create plans to provision them on this deployment.</p>
            </CardContent>
          </Card>
        )}

        {!plansLoading && planAssignments.length > 0 && (
          <div className="flex flex-col gap-4">
            {planAssignments.map((plan: DeploymentPlanAssignment) => (
              <PlanCard key={plan.planId} plan={plan} onToggle={handleToggle} />
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
        icon={Server}
        title="Edit Deployment"
        description="Update the details for this deployment."
        content={(close) => <EditDeploymentForm deployment={deployment} onSuccess={close} onCancel={close} />}
      />
    </div>
  );
};

interface PlanCardProps {
  plan: DeploymentPlanAssignment;
  onToggle: (plan: DeploymentPlanAssignment) => void;
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
      <p className="text-xs text-muted-foreground">{plan.businessName}</p>
    </CardHeader>
    <CardContent className="pt-0">
      <Button variant={plan.isAssigned ? 'default' : 'outline'} size="sm" onClick={() => onToggle(plan)}>
        {plan.isAssigned ? 'Provisioned' : 'Provision'}
      </Button>
    </CardContent>
  </Card>
);
