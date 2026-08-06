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
import { useVersionContext } from '@/context/VersionScopeContext';

const addPlanFormSchema = z
  .object({
    name: z.string().min(1, 'Plan name is required').max(100, 'Name must be 100 characters or less'),
    code: z.string().min(1, 'Plan code is required').max(100, 'Code must be 100 characters or less'),
    isCustom: z.boolean().optional(),
    organizationId: z.string().optional(),
    // Blank = unlimited sites.
    maxSites: z.string().regex(/^\d+$/, 'Enter a whole number').optional().or(z.literal('')),
    // Required — every plan declares a storage allowance.
    storageLimitMb: z.string().min(1, 'Storage limit is required').regex(/^\d+$/, 'Enter a whole number of MB'),
  })
  .superRefine((data, ctx) => {
    if (data.isCustom && !data.organizationId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select an organization', path: ['organizationId'] });
    }
  });

type AddPlanFormData = z.infer<typeof addPlanFormSchema>;

interface AddPlanFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddPlanForm: React.FC<AddPlanFormProps> = ({ onSuccess, onCancel }) => {
  const { versionId, businessId } = useVersionContext();
  const form = useForm<AddPlanFormData>({
    resolver: zodResolver(addPlanFormSchema),
    defaultValues: { name: '', code: '', isCustom: false, organizationId: '', maxSites: '', storageLimitMb: '' },
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
        maxSites: data.maxSites ? Number(data.maxSites) : undefined,
        storageLimitMb: Number(data.storageLimitMb),
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
        <Button type="submit" loadingText="Adding...">
          Add Plan
        </Button>
      </DialogActions>
    </Form>
  );
};
