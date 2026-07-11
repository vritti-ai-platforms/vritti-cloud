import { useUpdateFeature } from '@hooks/admin/versions/features';
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
import type { Feature } from '@/schemas/admin/features';
import {
  SCOPE_OPTIONS,
  SITE_TYPE_VALUES,
  type UpdateFeatureData,
  type UpdateFeatureInput,
  updateFeatureSchema,
} from '@/schemas/admin/features';
import { SiteTypeChecklist } from './SiteTypeChecklist';

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
      scope: feature.scope,
      applicableSiteTypes: feature.applicableSiteTypes?.length ? feature.applicableSiteTypes : [...SITE_TYPE_VALUES],
      lucideIcon: feature.lucideIcon,
      sfSymbol: feature.sfSymbol,
      materialSymbol: feature.materialSymbol,
      description: feature.description ?? '',
    },
  });

  const updateMutation = useUpdateFeature(versionId, { onSuccess });
  const scope = form.watch('scope');

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
        <Button type="submit" loadingText="Saving...">
          Save Changes
        </Button>
      </DialogActions>
    </Form>
  );
};
