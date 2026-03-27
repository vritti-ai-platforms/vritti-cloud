import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateFeature } from '@hooks/admin/features';
import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { TextField } from '@vritti/quantum-ui/TextField';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { useVersionContext } from '@/hooks/admin/versions/useVersionContext';
import { type CreateFeatureData, type CreateFeatureInput, createFeatureSchema } from '@/schemas/admin/features';

interface AddFeatureFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddFeatureForm: React.FC<AddFeatureFormProps> = ({ onSuccess, onCancel }) => {
  const { versionId } = useVersionContext();

  const form = useForm<CreateFeatureInput, unknown, CreateFeatureData>({
    resolver: zodResolver(createFeatureSchema),
    defaultValues: {
      code: '',
      name: '',
      versionId: versionId ?? '',
      icon: '',
      description: '',
    },
  });

  const createMutation = useCreateFeature(versionId, { onSuccess });

  return (
    <Form form={form} mutation={createMutation} showRootError onCancel={onCancel}>
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
        <Button type="submit" loadingText="Adding...">
          Add Feature
        </Button>
      </div>
    </Form>
  );
};
