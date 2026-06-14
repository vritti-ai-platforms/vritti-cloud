import { useUpdateBusiness } from '@hooks/admin/businesses';
import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
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
      <TextField name="code" label="Code" placeholder="e.g. HLTH" />
      <TextField
        name="description"
        label="Description (Optional)"
        placeholder="e.g. Hospitals, clinics, and medical services"
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
