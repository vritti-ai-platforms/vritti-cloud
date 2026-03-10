import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdateIndustry } from '@hooks/admin/industries';
import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { TextField } from '@vritti/quantum-ui/TextField';
import type React from 'react';
import { useForm } from 'react-hook-form';
import type { Industry } from '@/schemas/admin/industries';
import { type UpdateIndustryData, updateIndustrySchema } from '@/schemas/admin/industries';

interface EditIndustryFormProps {
  industry: Industry;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditIndustryForm: React.FC<EditIndustryFormProps> = ({ industry, onSuccess, onCancel }) => {
  const form = useForm<UpdateIndustryData>({
    resolver: zodResolver(updateIndustrySchema),
    defaultValues: {
      name: industry.name,
      code: industry.code,
      description: industry.description ?? '',
    },
  });

  const updateMutation = useUpdateIndustry({
    onSuccess: () => {
      onSuccess();
    },
  });

  // Cancel resets the form then notifies the parent
  const handleCancel = () => {
    form.reset();
    onCancel();
  };

  return (
    <Form form={form} mutation={updateMutation} showRootError transformSubmit={(data) => ({ id: industry.id, data })}>
      <TextField name="name" label="Industry Name" placeholder="e.g. Healthcare" />
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
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" loadingText="Saving...">
          Save Changes
        </Button>
      </div>
    </Form>
  );
};
