import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { CloudProviderSelector } from '@vritti/quantum-ui/selects/cloud-provider';
import { DeploymentSelector } from '@vritti/quantum-ui/selects/deployment';
import { RegionSelector } from '@vritti/quantum-ui/selects/region';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useWatch } from 'react-hook-form';
import type { CreateOrgFormData } from '@/schemas/cloud/organizations';

interface InfrastructureStepProps {
  form: UseFormReturn<CreateOrgFormData>;
  onBack: () => void;
  onContinue: () => void;
}

export const InfrastructureStep: React.FC<InfrastructureStepProps> = ({ form, onBack, onContinue }) => {
  const regionId = useWatch({ control: form.control, name: 'regionId' });
  const cloudProviderId = useWatch({ control: form.control, name: 'cloudProviderId' });

  const canContinue = !!(regionId && cloudProviderId && form.getValues('deploymentId'));

  return (
    <Form form={form} onSubmit={onContinue}>
      <div className="flex flex-col gap-6">
        {/* Region */}
        <div>
          <RegionSelector
            name="regionId"
            label="Region"
            placeholder="Select a region"
            onOptionSelect={(opt) => {
              form.setValue('regionName', opt?.label ?? '');
              form.setValue('cloudProviderId', '');
              form.setValue('cloudProviderName', '');
              form.setValue('deploymentId', '');
              form.setValue('deploymentName', '');
            }}
          />
        </div>

        {/* Cloud Provider */}
        <div>
          <CloudProviderSelector
            name="cloudProviderId"
            label="Cloud Provider"
            placeholder={regionId ? 'Select a cloud provider' : 'Select a region first'}
            disabled={!regionId}
            onOptionSelect={(opt) => {
              form.setValue('cloudProviderName', opt?.label ?? '');
              form.setValue('deploymentId', '');
              form.setValue('deploymentName', '');
            }}
          />
        </div>

        {/* Deployment */}
        <div>
          <DeploymentSelector
            name="deploymentId"
            label="Deployment"
            placeholder={cloudProviderId ? 'Select a deployment' : 'Select a cloud provider first'}
            disabled={!cloudProviderId}
            onOptionSelect={(opt) => {
              form.setValue('deploymentName', opt?.label ?? '');
              form.setValue('planId', '');
              form.setValue('planName', '');
            }}
          />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button type="submit" disabled={!canContinue}>
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Form>
  );
};
