import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdatePlan } from '@hooks/admin/plans';
import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { TextField } from '@vritti/quantum-ui/TextField';
import type React from 'react';
import { useForm } from 'react-hook-form';
import type { Plan } from '@/schemas/admin/plans';
import { type UpdatePlanData, updatePlanSchema } from '@/schemas/admin/plans';

interface EditPlanFormProps {
  plan: Plan;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditPlanForm: React.FC<EditPlanFormProps> = ({ plan, onSuccess, onCancel }) => {
  const form = useForm<UpdatePlanData>({
    resolver: zodResolver(updatePlanSchema),
    defaultValues: { name: plan.name, code: plan.code },
  });

  const updateMutation = useUpdatePlan({
    onSuccess: () => {
      onSuccess();
    },
  });

  // Cancel resets the form then notifies the parent
  const handleCancel = () => {
    form.reset();
    onCancel();
  };

  return (
    <Form form={form} mutation={updateMutation} showRootError transformSubmit={(data) => ({ id: plan.id, data })}>
      <TextField name="name" label="Plan Name" placeholder="e.g. Pro" />
      <TextField name="code" label="Code" placeholder="e.g. pro" description="Unique code identifier for this plan" />
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" loadingText="Saving...">
          Save Changes
        </Button>
      </div>
    </Form>
  );
};
