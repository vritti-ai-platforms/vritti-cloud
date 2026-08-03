import { useCreateDeployment } from '@hooks/admin/deployments';
import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { RadioGroup } from '@vritti/quantum-ui/RadioGroup';
import { Select } from '@vritti/quantum-ui/Select';
import { StepProgressIndicator } from '@vritti/quantum-ui/StepProgressIndicator';
import { CloudProviderSelector } from '@vritti/quantum-ui/selects/cloud-provider';
import { RegionSelector } from '@vritti/quantum-ui/selects/region';
import { VersionSelector } from '@vritti/quantum-ui/selects/version';
import { buildSlug } from '@vritti/quantum-ui/slug';
import { TextField } from '@vritti/quantum-ui/TextField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { zodResolver } from '@vritti/quantum-ui/zod';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { type FieldPath, type UseFormReturn, useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  assembleSecretProvider,
  type CreateDeploymentData,
  createDeploymentSchema,
  DEFAULT_SECRET_PROVIDER,
  DEPLOYMENT_DB_MODE_OPTIONS,
  DEPLOYMENT_TENANT_TYPE_OPTIONS,
  DEPLOYMENT_TYPE_OPTIONS,
  SECRET_AUTH_METHOD_FIELDS,
  type SecretAuthMethod,
} from '@/schemas/admin/deployments';
import { renderAddonToggles, renderSecretStoreFields } from './components/configFields';
import { AGENT_WIZARD_STEPS, MANUAL_WIZARD_STEPS, toStepDefs } from './wizardSteps';

type DeploymentForm = UseFormReturn<CreateDeploymentData>;

const MANAGEMENT_MODE_OPTIONS = [
  {
    value: 'agent',
    label: 'Managed',
    description: 'Provisioned and operated by an agent on a cloud region and provider.',
  },
  {
    value: 'manual',
    label: 'Local',
    description: 'Self-hosted deployment you manage manually. A signing key is issued at creation.',
  },
];

// The full create payload for an agent deployment (secretProvider/secrets assembled from form state).
function toAgentCreatePayload(data: CreateDeploymentData): CreateDeploymentData {
  return { ...data, ...assembleSecretProvider(data) };
}

// Local deployments only carry general fields — the lifecycle (signing key, sync) runs post-create.
function toManualCreatePayload(data: CreateDeploymentData): CreateDeploymentData {
  return {
    name: data.name,
    url: data.url,
    managementMode: 'manual',
    version: data.version,
  };
}

export const DeploymentWizard: React.FC = () => {
  const navigate = useNavigate();
  const [configStep, setConfigStep] = useState(1);

  const form = useForm<CreateDeploymentData>({
    resolver: zodResolver(createDeploymentSchema),
    defaultValues: {
      name: '',
      url: '',
      managementMode: 'agent',
      mode: 'managed',
      edge: 'managed',
      addonPgbackrest: false,
      addonGitea: false,
      tenantType: 'shared',
      type: 'deployed',
      version: '',
      acmeEmail: '',
      secretProvider: DEFAULT_SECRET_PROVIDER,
      secretProviderSecrets: {},
    },
  });

  const managementMode = useWatch({ control: form.control, name: 'managementMode' });
  const isAgent = managementMode === 'agent';
  const steps = isAgent ? AGENT_WIZARD_STEPS : MANUAL_WIZARD_STEPS;

  const createMutation = useCreateDeployment({
    onSuccess: (response) => {
      const deployment = response.data;
      navigate(`/deployments/${buildSlug(deployment.name, deployment.id)}`);
    },
  });

  const next = () => setConfigStep((step) => step + 1);
  const back = () => setConfigStep((step) => Math.max(1, step - 1));
  const cancel = () => navigate('/deployments');

  return (
    <div className="mx-auto max-w-5xl">
      <div className="px-6 pt-6">
        <PageHeader
          title="Add a new deployment"
          description="Register a deployment environment in a few steps"
          actions={
            <Button variant="ghost" size="sm" onClick={cancel}>
              Cancel
            </Button>
          }
        />
      </div>

      <div className="px-6 pt-6">
        <StepProgressIndicator steps={toStepDefs(steps)} currentStep={configStep} />
      </div>

      <div className="px-6 py-6">
        {configStep === 1 && (
          <GeneralStep
            form={form}
            isAgent={isAgent}
            createMutation={createMutation}
            onContinue={next}
            onCancel={cancel}
          />
        )}

        {isAgent && configStep === 2 && <DatabaseStep form={form} onBack={back} onContinue={next} />}

        {isAgent && configStep === 3 && <AddonsStep form={form} onBack={back} onContinue={next} />}

        {isAgent && configStep === 4 && <SecretStoreStep form={form} createMutation={createMutation} onBack={back} />}
      </div>
    </div>
  );
};

// Validate-and-advance for non-final config steps — partial validation of just this step's fields,
// so later-step requirements (secret store, domains) don't block navigation.
function useAdvance(form: DeploymentForm, fields: FieldPath<CreateDeploymentData>[], onContinue: () => void) {
  return async () => {
    if (await form.trigger(fields)) onContinue();
  };
}

interface GeneralStepProps {
  form: DeploymentForm;
  isAgent: boolean;
  createMutation: ReturnType<typeof useCreateDeployment>;
  onContinue: () => void;
  onCancel: () => void;
}

const GeneralStep: React.FC<GeneralStepProps> = ({ form, isAgent, createMutation, onContinue, onCancel }) => {
  const regionId = useWatch({ control: form.control, name: 'regionId' });
  const advance = useAdvance(
    form,
    ['name', 'url', 'managementMode', 'type', 'regionId', 'cloudProviderId', 'version'],
    onContinue,
  );

  const fields = (
    <div className="space-y-4">
      <RadioGroup
        name="managementMode"
        label="Management Mode"
        variant="card"
        orientation="horizontal"
        options={MANAGEMENT_MODE_OPTIONS}
      />
      <TextField name="name" label="Deployment Name" placeholder="e.g. US East Production" />
      <TextField name="url" label="Endpoint URL" placeholder="https://nexus-us-east.vrittiai.com" />
      <Select
        name="type"
        label="Deployment Type"
        placeholder="Select type"
        description="Deployed routes core through an edge at api.<host>; local reaches core directly on the URL above."
        options={DEPLOYMENT_TYPE_OPTIONS}
      />
      {isAgent && (
        <>
          <Select
            name="tenantType"
            label="Tenancy"
            placeholder="Select tenancy"
            options={DEPLOYMENT_TENANT_TYPE_OPTIONS}
          />
          <RegionSelector
            name="regionId"
            label="Region"
            placeholder="Select region"
            onOptionSelect={() => form.setValue('cloudProviderId', '')}
          />
          <CloudProviderSelector
            name="cloudProviderId"
            label="Cloud Provider"
            placeholder="Select provider"
            disabled={!regionId}
            params={regionId ? { regionId: String(regionId) } : undefined}
          />
        </>
      )}
      <VersionSelector name="version" label="Version" placeholder="Select version" />
    </div>
  );

  // Local deployments finish config here — this step submits the create call.
  if (!isAgent) {
    return (
      <Form form={form} mutation={createMutation} resetOnSuccess={false} transformSubmit={toManualCreatePayload}>
        {fields}
        <div className="flex justify-between pt-6">
          <Button type="button" variant="outline" onClick={onCancel} startAdornment={<ArrowLeft className="size-4" />}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={createMutation.isPending}
            loadingText="Creating..."
            startAdornment={<Check className="size-4" />}
          >
            Create Deployment
          </Button>
        </div>
      </Form>
    );
  }

  return (
    <Form form={form} resetOnSuccess={false}>
      {fields}
      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" onClick={onCancel} startAdornment={<ArrowLeft className="size-4" />}>
          Cancel
        </Button>
        <Button type="button" onClick={advance} endAdornment={<ArrowRight className="size-4" />}>
          Continue
        </Button>
      </div>
    </Form>
  );
};

interface StepProps {
  form: DeploymentForm;
  onBack: () => void;
  onContinue: () => void;
}

const DatabaseStep: React.FC<StepProps> = ({ form, onBack, onContinue }) => {
  const dbMode = useWatch({ control: form.control, name: 'mode' });
  const advance = useAdvance(form, ['mode'], onContinue);

  return (
    <Form form={form} resetOnSuccess={false}>
      <div className="space-y-4">
        <div>
          <Typography variant="subtitle2">Database</Typography>
          <Typography variant="body2" intent="muted">
            Choose whether the agent runs its own Postgres or connects to an existing database.
          </Typography>
        </div>
        <RadioGroup
          name="mode"
          variant="card"
          orientation="horizontal"
          options={DEPLOYMENT_DB_MODE_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
            description:
              option.value === 'managed'
                ? 'The agent runs and manages a Postgres instance.'
                : 'The agent connects to an existing database using credentials from the secret store.',
          }))}
        />
        {dbMode === 'external' && (
          <p className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
            The agent won't run Postgres. Provide the DB connection in the secret store; the agent connects using those
            creds.
          </p>
        )}
      </div>
      <StepFooter onBack={onBack} onContinue={advance} />
    </Form>
  );
};

const AddonsStep: React.FC<StepProps> = ({ form, onBack, onContinue }) => {
  const advance = useAdvance(form, ['acmeEmail'], onContinue);

  return (
    <Form form={form} resetOnSuccess={false}>
      {renderAddonToggles()}
      <StepFooter onBack={onBack} onContinue={advance} />
    </Form>
  );
};

interface SecretStoreStepProps {
  form: DeploymentForm;
  createMutation: ReturnType<typeof useCreateDeployment>;
  onBack: () => void;
}

const SecretStoreStep: React.FC<SecretStoreStepProps> = ({ form, createMutation, onBack }) => {
  const authMethod = useWatch({ control: form.control, name: 'secretProvider.auth.method' }) as
    | SecretAuthMethod
    | undefined;
  const authFields = authMethod ? (SECRET_AUTH_METHOD_FIELDS[authMethod] ?? []) : [];

  return (
    <Form form={form} mutation={createMutation} resetOnSuccess={false} transformSubmit={toAgentCreatePayload}>
      {renderSecretStoreFields({ authFields })}
      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" onClick={onBack} startAdornment={<ArrowLeft className="size-4" />}>
          Back
        </Button>
        <Button
          type="submit"
          isLoading={createMutation.isPending}
          loadingText="Creating..."
          startAdornment={<Check className="size-4" />}
        >
          Create Deployment
        </Button>
      </div>
    </Form>
  );
};

const StepFooter: React.FC<{ onBack: () => void; onContinue: () => void }> = ({ onBack, onContinue }) => (
  <div className="flex justify-between pt-6">
    <Button type="button" variant="outline" onClick={onBack} startAdornment={<ArrowLeft className="size-4" />}>
      Back
    </Button>
    <Button type="button" onClick={onContinue} endAdornment={<ArrowRight className="size-4" />}>
      Continue
    </Button>
  </div>
);
