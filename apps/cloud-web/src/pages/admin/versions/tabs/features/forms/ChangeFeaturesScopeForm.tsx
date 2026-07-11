import { useChangeFeaturesScope } from '@hooks/admin/versions/features';
import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { Select } from '@vritti/quantum-ui/Select';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { useVersionContext } from '@/context/VersionScopeContext';
import { type ChangeFeaturesScopeFormData, changeFeaturesScopeSchema, SCOPE_OPTIONS } from '@/schemas/admin/features';

interface ChangeFeaturesScopeFormProps {
  featureIds: string[];
  onSuccess: () => void;
  onCancel: () => void;
}

export const ChangeFeaturesScopeForm: React.FC<ChangeFeaturesScopeFormProps> = ({
  featureIds,
  onSuccess,
  onCancel,
}) => {
  const { versionId } = useVersionContext();

  const form = useForm<ChangeFeaturesScopeFormData>({
    resolver: zodResolver(changeFeaturesScopeSchema),
    defaultValues: { scope: 'SITE' },
  });

  const changeScopeMutation = useChangeFeaturesScope(versionId, { onSuccess });

  return (
    <Form
      form={form}
      mutation={changeScopeMutation}
      onCancel={onCancel}
      transformSubmit={(data) => ({ featureIds, scope: data.scope })}
    >
      <Select name="scope" label="Scope" placeholder="Select scope" options={SCOPE_OPTIONS} />
      <DialogActions>
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Updating...">
          Change scope of {featureIds.length} {featureIds.length === 1 ? 'feature' : 'features'}
        </Button>
      </DialogActions>
    </Form>
  );
};
