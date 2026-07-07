import { useUpdateBillingCycle } from '@hooks/admin/billing-cycles';
import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { FieldGroup, Form } from '@vritti/quantum-ui/Form';
import { Switch } from '@vritti/quantum-ui/Switch';
import { TextField } from '@vritti/quantum-ui/TextField';
import { z, zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';
import type { BillingCycle, UpdateBillingCycleData } from '@/schemas/admin/billing-cycles';

const editBillingCycleFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be 255 characters or less'),
  days: z
    .string()
    .regex(/^\d+$/, 'Enter a whole number')
    .refine((v) => Number(v) >= 1, 'Days must be at least 1'),
  sortOrder: z.string().regex(/^\d+$/, 'Enter a whole number').optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

type EditBillingCycleFormValues = z.infer<typeof editBillingCycleFormSchema>;

interface EditBillingCycleFormProps {
  billingCycle: BillingCycle;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditBillingCycleForm: React.FC<EditBillingCycleFormProps> = ({ billingCycle, onSuccess, onCancel }) => {
  const form = useForm<EditBillingCycleFormValues>({
    resolver: zodResolver(editBillingCycleFormSchema),
    defaultValues: {
      name: billingCycle.name,
      days: String(billingCycle.days),
      sortOrder: String(billingCycle.sortOrder),
      isActive: billingCycle.isActive,
    },
  });

  const updateMutation = useUpdateBillingCycle({ onSuccess });

  return (
    <Form
      form={form}
      mutation={updateMutation}
      resetOnSuccess={false}
      onCancel={onCancel}
      transformSubmit={(data) => {
        const payload: UpdateBillingCycleData = {
          name: data.name,
          days: Number(data.days),
          sortOrder: data.sortOrder ? Number(data.sortOrder) : undefined,
          isActive: data.isActive,
        };
        return { id: billingCycle.id, data: payload };
      }}
    >
      <FieldGroup>
        <TextField name="name" label="Name" placeholder="e.g. Monthly" />
        <TextField
          name="days"
          type="number"
          label="Days"
          placeholder="e.g. 30"
          description="Length of the cycle in days"
        />
        <TextField
          name="sortOrder"
          type="number"
          label="Sort Order"
          placeholder="0"
          description="Lower values appear first"
        />
      </FieldGroup>
      <Switch name="isActive" label="Active" description="Inactive cycles are hidden from pricing" />
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
