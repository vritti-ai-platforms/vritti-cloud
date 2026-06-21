import { useCreatePlan } from '@hooks/admin/versions/businesses/plans';
import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { Select } from '@vritti/quantum-ui/Select';
import { Switch } from '@vritti/quantum-ui/Switch';
import { TextField } from '@vritti/quantum-ui/TextField';
import { z, zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm, useWatch } from 'react-hook-form';

const addPlanFormSchema = z
  .object({
    name: z.string().min(1, 'Plan name is required').max(100, 'Name must be 100 characters or less'),
    code: z.string().min(1, 'Plan code is required').max(100, 'Code must be 100 characters or less'),
    isCustom: z.boolean().optional(),
    organizationId: z.string().optional(),
    // Blank = unlimited business units.
    maxBusinessUnits: z.string().regex(/^\d+$/, 'Enter a whole number').optional().or(z.literal('')),
  })
  .superRefine((data, ctx) => {
    if (data.isCustom && !data.organizationId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select an organization', path: ['organizationId'] });
    }
  });

type AddPlanFormData = z.infer<typeof addPlanFormSchema>;

interface AddPlanFormProps {
  versionId: string;
  businessId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddPlanForm: React.FC<AddPlanFormProps> = ({ versionId, businessId, onSuccess, onCancel }) => {
  const form = useForm<AddPlanFormData>({
    resolver: zodResolver(addPlanFormSchema),
    defaultValues: { name: '', code: '', isCustom: false, organizationId: '', maxBusinessUnits: '' },
  });

  const isCustom = useWatch({ control: form.control, name: 'isCustom' });
  const createMutation = useCreatePlan(versionId, businessId, { onSuccess });

  return (
    <Form
      form={form}
      mutation={createMutation}
      resetOnSuccess
      onCancel={onCancel}
      transformSubmit={(data) => ({
        name: data.name,
        code: data.code,
        isCustom: !!data.isCustom,
        ...(data.isCustom ? { organizationId: data.organizationId } : {}),
        maxBusinessUnits: data.maxBusinessUnits ? Number(data.maxBusinessUnits) : undefined,
      })}
    >
      <TextField name="name" label="Plan Name" placeholder="e.g. Pro" />
      <TextField name="code" label="Code" placeholder="e.g. pro" />
      <Switch name="isCustom" label="Custom plan" description="Bespoke plan attached to a single organization" />
      {isCustom && (
        <Select
          name="organizationId"
          label="Organization"
          placeholder="Select organization"
          searchable
          optionsEndpoint="select-api/organizations"
          fieldKeys={{ valueKey: 'id', labelKey: 'name', descriptionKey: 'code' }}
        />
      )}
      <TextField
        name="maxBusinessUnits"
        label="Max Business Units"
        placeholder="Blank = unlimited"
        description="Leave blank for unlimited business units"
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
