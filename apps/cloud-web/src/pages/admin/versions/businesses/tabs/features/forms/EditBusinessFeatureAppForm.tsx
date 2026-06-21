import { useSetBusinessFeatureApp } from '@hooks/admin/versions/businesses/features';
import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { AppSelector } from '@vritti/quantum-ui/selects/app';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { useVersionContext } from '@/context/VersionScopeContext';
import type { BusinessFeature, SetFeatureAppData } from '@/schemas/admin/business-features';
import { setFeatureAppSchema } from '@/schemas/admin/business-features';

interface EditBusinessFeatureAppFormProps {
  feature: BusinessFeature;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditBusinessFeatureAppForm: React.FC<EditBusinessFeatureAppFormProps> = ({
  feature,
  onSuccess,
  onCancel,
}) => {
  const { versionId, businessId } = useVersionContext();
  const form = useForm<SetFeatureAppData>({
    resolver: zodResolver(setFeatureAppSchema),
    defaultValues: {
      appId: feature.app?.id ?? '',
    },
  });

  const mutation = useSetBusinessFeatureApp({ onSuccess });

  return (
    <Form
      form={form}
      mutation={mutation}
      resetOnSuccess={false}
      onCancel={onCancel}
      transformSubmit={(data) => ({ versionId, businessId, featureId: feature.id, data })}
    >
      <AppSelector
        name="appId"
        label="App"
        placeholder="Select the app this feature belongs to"
        params={{ versionId, businessId }}
      />
      <DialogActions>
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Saving...">
          Save App
        </Button>
      </DialogActions>
    </Form>
  );
};
