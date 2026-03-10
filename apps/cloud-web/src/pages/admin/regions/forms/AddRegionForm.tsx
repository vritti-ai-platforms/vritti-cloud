import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateRegion } from '@hooks/admin/regions';
import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { Switch } from '@vritti/quantum-ui/Switch';
import { TextField } from '@vritti/quantum-ui/TextField';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { type CreateRegionData, createRegionSchema } from '@/schemas/admin/regions';

interface AddRegionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddRegionForm: React.FC<AddRegionFormProps> = ({ onSuccess, onCancel }) => {
  const form = useForm<CreateRegionData>({
    resolver: zodResolver(createRegionSchema),
    defaultValues: { name: '', code: '', country: '', state: '', city: '', isActive: true },
  });

  const createMutation = useCreateRegion({
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
      <TextField name="name" label="Region Name" placeholder="e.g. Asia Pacific — Mumbai" />
      <TextField name="city" label="City" placeholder="e.g. Mumbai" />
      <TextField name="state" label="State" placeholder="e.g. Maharashtra" />
      <TextField name="country" label="Country" placeholder="e.g. India" />
      <TextField
        name="code"
        label="Code"
        placeholder="e.g. ap-south-1"
        description="Short identifier used across the platform"
      />
      <Switch name="isActive" label="Active" description="Make this region available for new deployments" />
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" loadingText="Adding...">
          Add Region
        </Button>
      </div>
    </Form>
  );
};
