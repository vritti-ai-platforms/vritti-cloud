import { zodResolver } from '@hookform/resolvers/zod';
import { useAssignDeploymentPlan } from '@hooks/admin/deployments';
import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { IndustrySelector } from '@vritti/quantum-ui/selects/industry';
import { PlanSelector } from '@vritti/quantum-ui/selects/plan';
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
    <Form form={form} mutation={assignMutation} showRootError transformSubmit={(data) => ({ id: deploymentId, data })}>
      <PlanSelector name="planId" label="Plan" placeholder="Select plan" />
      <IndustrySelector name="industryId" label="Industry" placeholder="Select industry" />
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" loadingText="Assigning...">
          Assign Plan
        </Button>
      </div>
    </Form>
  );
};
