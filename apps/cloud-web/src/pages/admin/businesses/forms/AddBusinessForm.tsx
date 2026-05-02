import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateBusiness } from '@hooks/admin/businesses';
import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { AppCodeSelector } from '@vritti/quantum-ui/selects/app-code';
import { TextField } from '@vritti/quantum-ui/TextField';
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
    defaultValues: { name: '', code: '', description: '', recommendedApps: [] },
  });

  const createMutation = useCreateBusiness({ onSuccess });

  return (
    <Form form={form} mutation={createMutation} resetOnSuccess onCancel={onCancel}>
      <TextField name="name" label="Business Name" placeholder="e.g. Healthcare" />
      <TextField
        name="code"
        label="Code"
        placeholder="e.g. HLTH"
        description="Short identifier used across the platform"
      />
      <TextField
        name="description"
        label="Description"
        placeholder="e.g. Hospitals, clinics, and medical services"
        description="Optional"
      />
      <AppCodeSelector name="recommendedApps" label="Recommended Apps" multiple />
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Adding...">
          Add Business
        </Button>
      </div>
    </Form>
  );
};
