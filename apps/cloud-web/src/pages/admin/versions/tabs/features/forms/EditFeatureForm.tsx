import { useUpdateFeature } from '@hooks/admin/versions/features';
import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { IconSelect } from '@vritti/quantum-ui/selects/icon';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { useVersionContext } from '@/context/VersionScopeContext';
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
      lucideIcon: feature.lucideIcon,
      sfSymbol: feature.sfSymbol,
      materialSymbol: feature.materialSymbol,
      description: feature.description ?? '',
    },
  });

  const updateMutation = useUpdateFeature(versionId, { onSuccess });

  return (
    <Form
      form={form}
      mutation={updateMutation}
      resetOnSuccess={false}
      onCancel={onCancel}
      transformSubmit={(data) => ({ id: feature.id, data })}
    >
      <div className="grid grid-cols-2 gap-4">
        <TextField name="code" label="Code" placeholder="e.g. orders" description="Lowercase with hyphens" />
        <TextField name="name" label="Name" placeholder="e.g. Orders" />
      </div>
      <IconSelect kind="lucide" name="lucideIcon" label="Icon" placeholder="Select icon" clearable={false} />
      <IconSelect kind="sf" name="sfSymbol" label="SF Symbol (iOS)" placeholder="Select icon" clearable={false} />
      <IconSelect
        kind="material"
        name="materialSymbol"
        label="Material Symbol (Android)"
        placeholder="Select icon"
        clearable={false}
      />
      <TextField name="description" label="Description" placeholder="Optional description" />

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
