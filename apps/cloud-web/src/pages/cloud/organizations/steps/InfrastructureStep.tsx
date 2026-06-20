import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { DeploymentSelector } from '@vritti/quantum-ui/selects/deployment';
import { VersionSelector } from '@vritti/quantum-ui/selects/version';
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
  const version = useWatch({ control: form.control, name: 'version' });
  const deploymentId = useWatch({ control: form.control, name: 'deploymentId' });

  const canContinue = !!(version && deploymentId);

  return (
    <Form form={form} onSubmit={onContinue} resetOnSuccess={false}>
      <div className="flex flex-col gap-6">
        {/* Version */}
        <div>
          <VersionSelector
            name="version"
            label="Version"
            placeholder="Select a version"
            onOptionSelect={(opt) => {
              form.setValue('versionName', opt?.label ?? '');
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
            placeholder={version ? 'Select a deployment' : 'Select a version first'}
            disabled={!version}
            params={version ? { version: String(version) } : undefined}
            onOptionSelect={(opt) => {
              form.setValue('deploymentName', opt?.label ?? '');
              form.setValue('planCode', '');
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
