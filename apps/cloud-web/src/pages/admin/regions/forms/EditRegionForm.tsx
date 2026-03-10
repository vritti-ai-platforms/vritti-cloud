import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdateRegion } from '@hooks/admin/regions';
import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { Switch } from '@vritti/quantum-ui/Switch';
import { TextField } from '@vritti/quantum-ui/TextField';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { type Region, type UpdateRegionData, updateRegionSchema } from '@/schemas/admin/regions';

interface EditRegionFormProps {
  region: Region;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditRegionForm: React.FC<EditRegionFormProps> = ({ region, onSuccess, onCancel }) => {
  const form = useForm<UpdateRegionData>({
    resolver: zodResolver(updateRegionSchema),
    defaultValues: {
      name: region.name,
      code: region.code,
      country: region.country,
      state: region.state,
      city: region.city,
      isActive: region.isActive,
    },
  });

  const updateMutation = useUpdateRegion({
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
    <Form form={form} mutation={updateMutation} transformSubmit={(data) => ({ id: region.id, data })} showRootError>
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
        <Button type="submit" loadingText="Saving...">
          Save Changes
        </Button>
      </div>
    </Form>
  );
};
