import { useCreateBusiness } from '@hooks/admin/businesses';
import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { type CreateBusinessData, createBusinessSchema } from '@/schemas/admin/businesses';

interface AddBusinessFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddBusinessForm: React.FC<AddBusinessFormProps> = ({ onSuccess, onCancel }) => {
  const form = useForm<CreateBusinessData>({
    resolver: zodResolver(createBusinessSchema),
    defaultValues: { name: '', code: '', description: '' },
  });

  const createMutation = useCreateBusiness({ onSuccess });

  return (
    <Form form={form} mutation={createMutation} resetOnSuccess onCancel={onCancel}>
      <TextField name="name" label="Business Name" placeholder="e.g. Healthcare" />
      <TextField name="code" label="Code" placeholder="e.g. HLTH" />
      <TextField name="description" label="Description" placeholder="e.g. Hospitals, clinics, and medical services" />
      <DialogActions>
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Adding...">
          Add Business
        </Button>
      </DialogActions>
    </Form>
  );
};
