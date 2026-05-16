import { useUpdateBusiness } from '@hooks/admin/businesses';
import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { AppCodeSelector } from '@vritti/quantum-ui/selects/app-code';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';
import type { Business } from '@/schemas/admin/businesses';
import { type UpdateBusinessData, updateBusinessSchema } from '@/schemas/admin/businesses';

interface EditBusinessFormProps {
  business: Business;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditBusinessForm: React.FC<EditBusinessFormProps> = ({ business, onSuccess, onCancel }) => {
  const form = useForm<UpdateBusinessData>({
    resolver: zodResolver(updateBusinessSchema),
    defaultValues: {
      name: business.name,
      code: business.code,
      description: business.description ?? '',
      recommendedApps: business.recommendedApps,
    },
  });

  const updateMutation = useUpdateBusiness({ onSuccess });

  return (
    <Form
      form={form}
      mutation={updateMutation}
      resetOnSuccess={false}
      onCancel={onCancel}
      transformSubmit={(data) => ({ id: business.id, data })}
    >
      <TextField name="name" label="Business Name" placeholder="e.g. Healthcare" />
      <TextField
        name="code"
        label="Code"
        placeholder="e.g. HLTH"
        description="Short identifier used across the platform"
      />
      <TextField
        name="description"
        label="Description (Optional)"
        placeholder="e.g. Hospitals, clinics, and medical services"
      />
      <AppCodeSelector name="recommendedApps" label="Recommended Apps" multiple />
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Saving...">
          Save Changes
        </Button>
      </div>
    </Form>
  );
};
