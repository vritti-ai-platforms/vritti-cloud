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
import { zodResolver } from '@vritti/quantum-ui/zod';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { type FieldPath, type UseFormReturn, useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  type CreateDeploymentData,
  createDeploymentSchema,
  DEPLOYMENT_TENANT_TYPE_OPTIONS,
  MANAGEMENT_TYPE_OPTIONS,
} from '@/schemas/admin/deployments';
import { renderWizardDatabaseFields, renderWizardEdgeFields } from './components/configFields';
import { MANAGED_WIZARD_STEPS, toStepDefs } from './wizardSteps';

type DeploymentForm = UseFormReturn<CreateDeploymentData>;

// Manual deployments carry only general fields — the lifecycle (signing key, sync) runs post-create.
function toManualCreatePayload(data: CreateDeploymentData): CreateDeploymentData {
  return { name: data.name, url: data.url, managementType: 'manual', version: data.version };
}

export const DeploymentWizard: React.FC = () => {
  const navigate = useNavigate();
  const [configStep, setConfigStep] = useState(1);

  const form = useForm<CreateDeploymentData>({
    resolver: zodResolver(createDeploymentSchema),
    defaultValues: {
      name: '',
      url: '',
      managementType: 'managed',
      tenantType: 'dedicated',
      version: '',
      components: {
        database: { mode: 'managed' },
        edge: { mode: 'managed', acmeEmail: '' },
      },
    },
  });

  const managementType = useWatch({ control: form.control, name: 'managementType' });
  const isManaged = managementType === 'managed';

  const createMutation = useCreateDeployment({
    onSuccess: (response) => {
      const deployment = response.data;
      navigate(`/deployments/dep-${buildSlug(deployment.name, deployment.id)}`);
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

      {isManaged && (
        <div className="px-6 pt-6">
          <StepProgressIndicator steps={toStepDefs(MANAGED_WIZARD_STEPS)} currentStep={configStep} />
        </div>
      )}

      <div className="px-6 py-6">
        {configStep === 1 && (
          <GeneralStep
            form={form}
            isManaged={isManaged}
            createMutation={createMutation}
            onContinue={next}
            onCancel={cancel}
          />
        )}

        {isManaged && configStep === 2 && <DatabaseStep form={form} onBack={back} onContinue={next} />}

        {isManaged && configStep === 3 && <EdgeStep form={form} createMutation={createMutation} onBack={back} />}
      </div>
    </div>
  );
};

// Validate-and-advance for non-final steps — partial validation of just this step's fields.
function useAdvance(form: DeploymentForm, fields: FieldPath<CreateDeploymentData>[], onContinue: () => void) {
  return async () => {
    if (await form.trigger(fields)) onContinue();
  };
}

interface GeneralStepProps {
  form: DeploymentForm;
  isManaged: boolean;
  createMutation: ReturnType<typeof useCreateDeployment>;
  onContinue: () => void;
  onCancel: () => void;
}

const GeneralStep: React.FC<GeneralStepProps> = ({ form, isManaged, createMutation, onContinue, onCancel }) => {
  const regionId = useWatch({ control: form.control, name: 'regionId' });
  const advance = useAdvance(
    form,
    ['name', 'url', 'managementType', 'regionId', 'cloudProviderId', 'version'],
    onContinue,
  );

  const fields = (
    <div className="space-y-4">
      <RadioGroup
        name="managementType"
        label="Management Type"
        variant="card"
        orientation="horizontal"
        options={MANAGEMENT_TYPE_OPTIONS}
      />
      <TextField name="name" label="Deployment Name" placeholder="e.g. US East Production" />
      <TextField name="url" label="Endpoint URL" placeholder="https://nexus-us-east.vrittiai.com" />
      {isManaged && (
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

  // Manual deployments finish config here — this step submits the create call.
  if (!isManaged) {
    return (
      <Form form={form} mutation={createMutation} resetOnSuccess={false} transformSubmit={toManualCreatePayload}>
        {fields}
        <p className="mt-4 rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
          Manual deployments collect only these general fields. There is no region, database, edge, add-on or
          secret-store configuration — you run the stack yourself; cloud only issues the signing key and syncs the
          catalog.
        </p>
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

const DatabaseStep: React.FC<{ form: DeploymentForm; onBack: () => void; onContinue: () => void }> = ({
  form,
  onBack,
  onContinue,
}) => {
  const dbMode = useWatch({ control: form.control, name: 'components.database.mode' });
  const advance = useAdvance(form, ['components.database.mode'], onContinue);

  return (
    <Form form={form} resetOnSuccess={false}>
      {renderWizardDatabaseFields({ managed: dbMode === 'managed' })}
      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" onClick={onBack} startAdornment={<ArrowLeft className="size-4" />}>
          Back
        </Button>
        <Button type="button" onClick={advance} endAdornment={<ArrowRight className="size-4" />}>
          Continue
        </Button>
      </div>
    </Form>
  );
};

// The final managed step — submits the create call, then lands on the deployment view's setup flow.
const EdgeStep: React.FC<{
  form: DeploymentForm;
  createMutation: ReturnType<typeof useCreateDeployment>;
  onBack: () => void;
}> = ({ form, createMutation, onBack }) => {
  const edgeMode = useWatch({ control: form.control, name: 'components.edge.mode' });

  return (
    <Form form={form} mutation={createMutation} resetOnSuccess={false}>
      {renderWizardEdgeFields({ managed: edgeMode === 'managed' })}
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
