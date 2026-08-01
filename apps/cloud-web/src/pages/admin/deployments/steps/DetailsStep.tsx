import { Button } from '@vritti/quantum-ui/Button';
import { Form } from '@vritti/quantum-ui/Form';
import { Select } from '@vritti/quantum-ui/Select';
import { CloudProviderSelector } from '@vritti/quantum-ui/selects/cloud-provider';
import { RegionSelector } from '@vritti/quantum-ui/selects/region';
import { VersionSelector } from '@vritti/quantum-ui/selects/version';
import { TextField } from '@vritti/quantum-ui/TextField';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useWatch } from 'react-hook-form';
import type { CreateDeploymentData } from '@/schemas/admin/deployments';
import { AgentDomainsAndSecretStore } from '../components/AgentDomainsAndSecretStore';

interface DetailsStepProps {
  form: UseFormReturn<CreateDeploymentData>;
  onBack: () => void;
  onContinue: () => void;
}

export const DetailsStep: React.FC<DetailsStepProps> = ({ form, onBack, onContinue }) => {
  const managementMode = useWatch({ control: form.control, name: 'managementMode' });
  const regionId = useWatch({ control: form.control, name: 'regionId' });
  const isAgent = managementMode === 'agent';

  return (
    <Form form={form} onSubmit={onContinue} resetOnSuccess={false}>
      <TextField name="name" label="Deployment Name" placeholder="e.g. US East Production" />
      <TextField name="url" label="Endpoint URL" placeholder="https://nexus-us-east.vrittiai.com" />

      {isAgent && (
        <>
          <Select
            name="type"
            label="Deployment Type"
            placeholder="Select type"
            options={[
              { value: 'shared', label: 'Shared' },
              { value: 'dedicated', label: 'Dedicated' },
            ]}
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
          <TextField name="acmeEmail" label="ACME Email" placeholder="admin@vrittiai.com" />
          <AgentDomainsAndSecretStore secretPlaceholder={(label) => `Enter ${label.toLowerCase()}`} />
        </>
      )}

      <VersionSelector name="version" label="Version" placeholder="Select version" />

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button type="submit">
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Form>
  );
};
