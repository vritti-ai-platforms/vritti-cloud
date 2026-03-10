import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateIndustry } from '@hooks/admin/industries';
import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { TextField } from '@vritti/quantum-ui/TextField';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { type CreateIndustryData, createIndustrySchema } from '@/schemas/admin/industries';

interface AddIndustryFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddIndustryForm: React.FC<AddIndustryFormProps> = ({ onSuccess, onCancel }) => {
  const form = useForm<CreateIndustryData>({
    resolver: zodResolver(createIndustrySchema),
    defaultValues: { name: '', code: '', description: '' },
  });

  const createMutation = useCreateIndustry({
    onSuccess: () => {
      form.reset();
      onSuccess();
    },
  });

  // Cancel resets the form then notifies the parent
  const handleCancel = () => {
    form.reset();
    onCancel();
  };

  return (
    <Form form={form} mutation={createMutation} showRootError>
      <TextField name="name" label="Industry Name" placeholder="e.g. Healthcare" />
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
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" loadingText="Adding...">
          Add Industry
        </Button>
      </div>
    </Form>
  );
};
