import { useCreateDeployment } from '@hooks/admin/deployments';
import { Button } from '@vritti/quantum-ui/Button';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { type StepDef, StepProgressIndicator } from '@vritti/quantum-ui/StepProgressIndicator';
import { buildSlug } from '@vritti/quantum-ui/slug';
import { zodResolver } from '@vritti/quantum-ui/zod';
import { ClipboardList, Server, Settings2 } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  type CreateDeploymentData,
  createDeploymentSchema,
  DEFAULT_SECRET_PROVIDER,
} from '@/schemas/admin/deployments';
import { DetailsStep } from './steps/DetailsStep';
import { ModeStep } from './steps/ModeStep';
import { ReviewStep } from './steps/ReviewStep';

const CREATE_DEPLOYMENT_STEPS: StepDef[] = [
  { label: 'Mode', icon: <Settings2 className="h-4 w-4" /> },
  { label: 'Details', icon: <Server className="h-4 w-4" /> },
  { label: 'Review', icon: <ClipboardList className="h-4 w-4" /> },
];

type WizardStep = 1 | 2 | 3;

export const CreateDeploymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<WizardStep>(1);

  const form = useForm<CreateDeploymentData>({
    resolver: zodResolver(createDeploymentSchema),
    defaultValues: {
      name: '',
      url: '',
      type: 'shared',
      version: '',
      acmeEmail: '',
      domains: [],
      secretProvider: DEFAULT_SECRET_PROVIDER,
      secretProviderSecrets: {},
    },
  });

  const createMutation = useCreateDeployment({
    onSuccess: (response) => {
      const deployment = response.data;
      const slug = buildSlug(deployment.name, deployment.id);
      navigate(`/deployments/${slug}`);
    },
  });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="px-6 pt-6 pb-0">
        <PageHeader
          title="Add a new deployment"
          description="Register a deployment environment in a few steps"
          actions={
            <Button variant="ghost" size="sm" onClick={() => navigate('/deployments')}>
              Cancel
            </Button>
          }
        />
      </div>

      <div className="px-6 pt-6 pb-0">
        <StepProgressIndicator steps={CREATE_DEPLOYMENT_STEPS} currentStep={step} />
      </div>

      <div className="px-6 py-6 space-y-6">
        {step === 1 && <ModeStep form={form} onContinue={() => setStep(2)} />}

        {step === 2 && <DetailsStep form={form} onBack={() => setStep(1)} onContinue={() => setStep(3)} />}

        {step === 3 && (
          <ReviewStep
            form={form}
            createMutation={createMutation}
            onBack={() => setStep(2)}
            onEditMode={() => setStep(1)}
            onEditDetails={() => setStep(2)}
          />
        )}
      </div>
    </div>
  );
};
