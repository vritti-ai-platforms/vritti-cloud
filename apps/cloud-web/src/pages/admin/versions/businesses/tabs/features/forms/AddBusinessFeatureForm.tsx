import { useSetBusinessFeatureApp } from '@hooks/admin/versions/businesses/features';
import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { AppSelector } from '@vritti/quantum-ui/selects/app';
import { FeatureSelector } from '@vritti/quantum-ui/selects/feature';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { useVersionContext } from '@/context/VersionScopeContext';
import { type AddBusinessFeatureData, addBusinessFeatureSchema } from '@/schemas/admin/business-features';

interface AddBusinessFeatureFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddBusinessFeatureForm: React.FC<AddBusinessFeatureFormProps> = ({ onSuccess, onCancel }) => {
  const { versionId, businessId } = useVersionContext();
  const form = useForm<AddBusinessFeatureData>({
    resolver: zodResolver(addBusinessFeatureSchema),
    defaultValues: {
      featureId: '',
      appId: '',
    },
  });

  const mutation = useSetBusinessFeatureApp({ onSuccess });

  return (
    <Form
      form={form}
      mutation={mutation}
      resetOnSuccess={false}
      onCancel={onCancel}
      transformSubmit={(data) => ({
        versionId,
        businessId,
        featureId: data.featureId,
        data: { appId: data.appId },
      })}
    >
      <FeatureSelector
        name="featureId"
        label="Feature"
        placeholder="Select a feature to add"
        params={{ versionId, businessId }}
      />
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
        <Button type="submit" loadingText="Adding...">
          Add Feature
        </Button>
      </DialogActions>
    </Form>
  );
};
