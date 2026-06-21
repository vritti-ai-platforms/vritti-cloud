import { useUpdatePlan } from '@hooks/admin/versions/businesses/plans';
import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { TextField } from '@vritti/quantum-ui/TextField';
import { z, zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';
import type { Plan } from '@/schemas/admin/plans';

const editPlanFormSchema = z.object({
  name: z.string().min(1, 'Plan name is required').max(100, 'Name must be 100 characters or less'),
  code: z.string().min(1, 'Plan code is required').max(100, 'Code must be 100 characters or less'),
});

type EditPlanFormData = z.infer<typeof editPlanFormSchema>;

interface EditPlanFormProps {
  plan: Plan;
  versionId: string;
  businessId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditPlanForm: React.FC<EditPlanFormProps> = ({ plan, versionId, businessId, onSuccess, onCancel }) => {
  const form = useForm<EditPlanFormData>({
    resolver: zodResolver(editPlanFormSchema),
    defaultValues: { name: plan.name, code: plan.code },
  });

  const updateMutation = useUpdatePlan(versionId, businessId, { onSuccess });

  return (
    <Form
      form={form}
      mutation={updateMutation}
      resetOnSuccess={false}
      onCancel={onCancel}
      transformSubmit={(data) => ({ id: plan.id, data: { name: data.name, code: data.code } })}
    >
      <TextField name="name" label="Plan Name" placeholder="e.g. Pro" />
      <TextField name="code" label="Code" placeholder="e.g. pro" description="Unique code identifier for this plan" />
      <DialogActions>
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Saving...">
          Save Changes
        </Button>
      </DialogActions>
    </Form>
  );
};
