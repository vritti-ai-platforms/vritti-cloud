import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdateFeature } from '@hooks/admin/features';
import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { TextField } from '@vritti/quantum-ui/TextField';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { useVersionContext } from '@/hooks/admin/versions/useVersionContext';
import type { Feature } from '@/schemas/admin/features';
import { type UpdateFeatureData, type UpdateFeatureInput, updateFeatureSchema } from '@/schemas/admin/features';

interface EditFeatureFormProps {
  feature: Feature;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditFeatureForm: React.FC<EditFeatureFormProps> = ({ feature, onSuccess, onCancel }) => {
  const { versionId } = useVersionContext();

  const form = useForm<UpdateFeatureInput, unknown, UpdateFeatureData>({
    resolver: zodResolver(updateFeatureSchema),
    defaultValues: {
      code: feature.code,
      name: feature.name,
      icon: feature.icon,
      description: feature.description ?? '',
    },
  });

  const updateMutation = useUpdateFeature(versionId, { onSuccess });

  return (
    <Form form={form} mutation={updateMutation} resetOnSuccess={false} onCancel={onCancel} transformSubmit={(data) => ({ id: feature.id, data })}>
      <div className="grid grid-cols-2 gap-4">
        <TextField
          name="code"
          label="Code"
          placeholder="e.g. orders"
          description="Lowercase with hyphens"
        />
        <TextField name="name" label="Name" placeholder="e.g. Orders" />
      </div>
      <TextField name="icon" label="Icon" placeholder="e.g. clipboard-list" description="Lucide icon name" />
      <TextField name="description" label="Description" placeholder="Optional description" />

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
