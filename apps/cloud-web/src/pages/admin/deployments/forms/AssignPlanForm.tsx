import { useAssignDeploymentPlan } from '@hooks/admin/deployments';
import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { BusinessSelector } from '@vritti/quantum-ui/selects/business';
import { PlanSelector } from '@vritti/quantum-ui/selects/plan';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { type AssignPlanData, assignPlanSchema } from '@/schemas/admin/deployments';

interface AssignPlanFormProps {
  deploymentId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AssignPlanForm: React.FC<AssignPlanFormProps> = ({ deploymentId, onSuccess, onCancel }) => {
  const form = useForm<AssignPlanData>({
    resolver: zodResolver(assignPlanSchema),
  });

  const assignMutation = useAssignDeploymentPlan({
    onSuccess: () => {
      form.reset();
      onSuccess();
    },
  });

  const handleCancel = () => {
    form.reset();
    onCancel();
  };

  return (
    <Form form={form} mutation={assignMutation} transformSubmit={(data) => ({ id: deploymentId, data })}>
      <PlanSelector name="planId" label="Plan" placeholder="Select plan" />
      <BusinessSelector name="businessId" label="Business" placeholder="Select business" />
      <DialogActions>
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" loadingText="Assigning...">
          Assign Plan
        </Button>
      </DialogActions>
    </Form>
  );
};
