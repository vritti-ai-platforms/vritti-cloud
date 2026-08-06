import { useUpdatePlan } from '@hooks/admin/versions/businesses/plans';
import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { TextField } from '@vritti/quantum-ui/TextField';
import { z, zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { useVersionContext } from '@/context/VersionScopeContext';
import type { Plan } from '@/schemas/admin/plans';

const editPlanFormSchema = z.object({
  name: z.string().min(1, 'Plan name is required').max(100, 'Name must be 100 characters or less'),
  code: z.string().min(1, 'Plan code is required').max(100, 'Code must be 100 characters or less'),
  // Blank = unlimited sites.
  maxSites: z.string().regex(/^\d+$/, 'Enter a whole number').optional().or(z.literal('')),
  storageLimitMb: z.string().min(1, 'Storage limit is required').regex(/^\d+$/, 'Enter a whole number of MB'),
});

type EditPlanFormData = z.infer<typeof editPlanFormSchema>;

interface EditPlanFormProps {
  plan: Plan;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditPlanForm: React.FC<EditPlanFormProps> = ({ plan, onSuccess, onCancel }) => {
  const { versionId, businessId } = useVersionContext();
  const form = useForm<EditPlanFormData>({
    resolver: zodResolver(editPlanFormSchema),
    defaultValues: {
      name: plan.name,
      code: plan.code,
      maxSites: plan.maxSites === null ? '' : String(plan.maxSites),
      storageLimitMb: String(plan.storageLimitMb),
    },
  });

  const updateMutation = useUpdatePlan(versionId, businessId, { onSuccess });

  return (
    <Form
      form={form}
      mutation={updateMutation}
      resetOnSuccess={false}
      onCancel={onCancel}
      transformSubmit={(data) => ({
        id: plan.id,
        data: {
          name: data.name,
          code: data.code,
          // Blank clears the limit — null, not undefined, or the PATCH would leave the old value in place
          maxSites: data.maxSites ? Number(data.maxSites) : null,
          storageLimitMb: Number(data.storageLimitMb),
        },
      })}
    >
      <TextField name="name" label="Plan Name" placeholder="e.g. Pro" />
      <TextField name="code" label="Code" placeholder="e.g. pro" description="Unique code identifier for this plan" />
      <TextField
        name="maxSites"
        label="Max Sites"
        placeholder="Blank = unlimited"
        description="Leave blank for unlimited sites"
      />
      <TextField
        name="storageLimitMb"
        label="Storage Limit (MB)"
        placeholder="e.g. 5120"
        description="Object storage allowance for organizations on this plan"
      />
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
