import { useSetBusinessFeatureApps } from '@hooks/admin/versions/businesses/features';
import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { AppSelector } from '@vritti/quantum-ui/selects/app';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';
import type { BusinessFeature, SetFeatureAppsData } from '@/schemas/admin/business-features';
import { setFeatureAppsSchema } from '@/schemas/admin/business-features';

interface EditBusinessFeatureAppsFormProps {
  versionId: string;
  businessId: string;
  feature: BusinessFeature;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditBusinessFeatureAppsForm: React.FC<EditBusinessFeatureAppsFormProps> = ({
  versionId,
  businessId,
  feature,
  onSuccess,
  onCancel,
}) => {
  const form = useForm<SetFeatureAppsData>({
    resolver: zodResolver(setFeatureAppsSchema),
    defaultValues: {
      appIds: feature.apps.map((app) => app.id),
    },
  });

  const mutation = useSetBusinessFeatureApps({ onSuccess });

  return (
    <Form
      form={form}
      mutation={mutation}
      resetOnSuccess={false}
      onCancel={onCancel}
      transformSubmit={(data) => ({ versionId, businessId, featureId: feature.id, data })}
    >
      <AppSelector
        name="appIds"
        multiple
        label="Apps"
        placeholder="Select the apps this feature belongs to"
        params={{ versionId, businessId }}
      />
      <DialogActions>
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Saving...">
          Save Apps
        </Button>
      </DialogActions>
    </Form>
  );
};
