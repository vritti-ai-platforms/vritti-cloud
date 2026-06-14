import { useCreatePlan } from '@hooks/admin/plans';
import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { majorToMinor } from '@vritti/quantum-ui/money';
import { BusinessSelector } from '@vritti/quantum-ui/selects/business';
import { TextField } from '@vritti/quantum-ui/TextField';
import { z, zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';

const addPlanFormSchema = z.object({
  name: z.string().min(1, 'Plan name is required').max(100, 'Name must be 100 characters or less'),
  code: z.string().min(1, 'Plan code is required').max(100, 'Code must be 100 characters or less'),
  businessId: z.string().uuid('Please select a vertical'),
  // Major USD reference price (optional) — converted to minor units on submit.
  usdAnchorMajor: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid amount (e.g. 49.99)')
    .optional()
    .or(z.literal('')),
});

type AddPlanFormData = z.infer<typeof addPlanFormSchema>;

interface AddPlanFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddPlanForm: React.FC<AddPlanFormProps> = ({ onSuccess, onCancel }) => {
  const form = useForm<AddPlanFormData>({
    resolver: zodResolver(addPlanFormSchema),
    defaultValues: { name: '', code: '', businessId: '', usdAnchorMajor: '' },
  });

  const createMutation = useCreatePlan({ onSuccess });

  return (
    <Form
      form={form}
      mutation={createMutation}
      resetOnSuccess
      onCancel={onCancel}
      transformSubmit={(data) => ({
        name: data.name,
        code: data.code,
        businessId: data.businessId,
        usdAnchor: data.usdAnchorMajor ? Number(majorToMinor(data.usdAnchorMajor, 'USD')) : null,
      })}
    >
      <TextField name="name" label="Plan Name" placeholder="e.g. Pro" />
      <TextField name="code" label="Code" placeholder="e.g. pro" />
      <BusinessSelector name="businessId" label="Vertical" placeholder="Select vertical" />
      <TextField
        name="usdAnchorMajor"
        label="USD Anchor (optional)"
        placeholder="e.g. 49.99"
        description="Reference price in USD used to anchor market prices"
      />
      <DialogActions>
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Adding...">
          Add Plan
        </Button>
      </DialogActions>
    </Form>
  );
};
