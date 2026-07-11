import { useCreateFeature } from '@hooks/admin/versions/features';
import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { Select } from '@vritti/quantum-ui/Select';
import { IconSelect } from '@vritti/quantum-ui/selects/icon';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { useVersionContext } from '@/context/VersionScopeContext';
import {
  type CreateFeatureData,
  type CreateFeatureInput,
  createFeatureSchema,
  SCOPE_OPTIONS,
  SITE_TYPE_VALUES,
} from '@/schemas/admin/features';
import { SiteTypeChecklist } from './SiteTypeChecklist';

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
      scope: 'SITE',
      applicableSiteTypes: [...SITE_TYPE_VALUES],
      lucideIcon: '',
      sfSymbol: '',
      materialSymbol: '',
      description: '',
    },
  });

  const createMutation = useCreateFeature(versionId, { onSuccess });
  const scope = form.watch('scope');

  return (
    <Form form={form} mutation={createMutation} onCancel={onCancel}>
      <div className="grid grid-cols-2 gap-4">
        <TextField name="code" label="Code" placeholder="e.g. orders" description="Lowercase with hyphens" />
        <TextField name="name" label="Name" placeholder="e.g. Orders" />
      </div>
      <Select name="scope" label="Scope" placeholder="Select scope" options={SCOPE_OPTIONS} />
      {scope === 'SITE' && (
        <SiteTypeChecklist
          name="applicableSiteTypes"
          label="Site Types"
          description="Site types where this feature is available"
        />
      )}
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
        <Button type="submit" loadingText="Adding...">
          Add Feature
        </Button>
      </DialogActions>
    </Form>
  );
};
