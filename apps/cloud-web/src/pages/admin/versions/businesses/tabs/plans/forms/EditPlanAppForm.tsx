import { useUpdatePlanApp } from '@hooks/admin/versions/businesses/plans/apps';
import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { Switch } from '@vritti/quantum-ui/Switch';
import { FeatureSelector } from '@vritti/quantum-ui/selects/feature';
import { z, zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';

const editPlanAppSchema = z.object({
  allFeatures: z.boolean(),
  featureCodes: z.array(z.string()).optional(),
});

type EditPlanAppFormData = z.infer<typeof editPlanAppSchema>;

interface EditPlanAppFormProps {
  versionId: string;
  businessId: string;
  planId: string;
  appCode: string;
  currentFeatureCodes: string[] | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditPlanAppForm: React.FC<EditPlanAppFormProps> = ({
  versionId,
  businessId,
  planId,
  appCode,
  currentFeatureCodes,
  onSuccess,
  onCancel,
}) => {
  const form = useForm<EditPlanAppFormData>({
    resolver: zodResolver(editPlanAppSchema),
    defaultValues: {
      allFeatures: currentFeatureCodes === null,
      featureCodes: currentFeatureCodes ?? [],
    },
  });

  const allFeatures = form.watch('allFeatures');
  const updateMutation = useUpdatePlanApp({ onSuccess });

  return (
    <Form
      form={form}
      mutation={updateMutation}
      resetOnSuccess={false}
      transformSubmit={(data) => ({
        versionId,
        businessId,
        planId,
        appId: appCode,
        data: {
          includedFeatureCodes: data.allFeatures ? null : (data.featureCodes ?? null),
        },
      })}
    >
      <Switch
        name="allFeatures"
        label="Include all features"
        description="When enabled, all features in this app are included in the plan"
      />
      {!allFeatures && (
        <FeatureSelector
          name="featureCodes"
          label="Included Features"
          placeholder="Select features to include..."
          multiple
          params={{ appCode }}
          fieldKeys={{ valueKey: 'code', labelKey: 'name', descriptionKey: 'code' }}
        />
      )}
      <DialogActions>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loadingText="Saving...">
          Save
        </Button>
      </DialogActions>
    </Form>
  );
};
