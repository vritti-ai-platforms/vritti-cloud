import { useCreateBillingCycle } from '@hooks/admin/billing-cycles';
import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { FieldGroup, Form } from '@vritti/quantum-ui/Form';
import { Switch } from '@vritti/quantum-ui/Switch';
import { TextField } from '@vritti/quantum-ui/TextField';
import { z, zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';
import type { CreateBillingCycleData } from '@/schemas/admin/billing-cycles';

const addBillingCycleFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be 255 characters or less'),
  days: z
    .string()
    .regex(/^\d+$/, 'Enter a whole number')
    .refine((v) => Number(v) >= 1, 'Days must be at least 1'),
  sortOrder: z.string().regex(/^\d+$/, 'Enter a whole number').optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

type AddBillingCycleFormValues = z.infer<typeof addBillingCycleFormSchema>;

interface AddBillingCycleFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddBillingCycleForm: React.FC<AddBillingCycleFormProps> = ({ onSuccess, onCancel }) => {
  const form = useForm<AddBillingCycleFormValues>({
    resolver: zodResolver(addBillingCycleFormSchema),
    defaultValues: { name: '', days: '30', sortOrder: '0', isActive: true },
  });

  const createMutation = useCreateBillingCycle({ onSuccess });

  return (
    <Form
      form={form}
      mutation={createMutation}
      resetOnSuccess
      onCancel={onCancel}
      transformSubmit={(data): CreateBillingCycleData => ({
        name: data.name,
        days: Number(data.days),
        sortOrder: data.sortOrder ? Number(data.sortOrder) : undefined,
        isActive: data.isActive,
      })}
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
        <Button type="submit" loadingText="Adding...">
          Add Billing Cycle
        </Button>
      </DialogActions>
    </Form>
  );
};
