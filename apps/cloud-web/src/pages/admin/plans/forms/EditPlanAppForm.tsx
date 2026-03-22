import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdatePlanApp } from '@hooks/admin/plan-apps';
import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { FeatureSelector } from '@vritti/quantum-ui/selects/feature';
import { Switch } from '@vritti/quantum-ui/Switch';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const editPlanAppSchema = z.object({
  allFeatures: z.boolean(),
  featureCodes: z.array(z.string()).optional(),
});

type EditPlanAppFormData = z.infer<typeof editPlanAppSchema>;

interface EditPlanAppFormProps {
  planId: string;
  appCode: string;
  currentFeatureCodes: string[] | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditPlanAppForm: React.FC<EditPlanAppFormProps> = ({
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
      showRootError
      resetOnSuccess={false}
      transformSubmit={(data) => ({
        planId,
        appId: appCode,
        data: {
          includedFeatureCodes: data.allFeatures ? null : data.featureCodes ?? null,
        },
      })}
    >
      <Switch name="allFeatures" label="Include all features" description="When enabled, all features in this app are included in the plan" />
      {!allFeatures && (
        <FeatureSelector
          name="featureCodes"
          label="Included Features"
          placeholder="Select features to include..."
          multiple
          optionsEndpoint={`admin-api/apps/codes/${appCode}/features/select`}
          fieldKeys={{ valueKey: 'code', labelKey: 'name', descriptionKey: 'code' }}
        />
      )}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loadingText="Saving...">
          Save
        </Button>
      </div>
    </Form>
  );
};
