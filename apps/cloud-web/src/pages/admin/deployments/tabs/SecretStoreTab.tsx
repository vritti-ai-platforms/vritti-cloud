import { useUpdateDeployment } from '@hooks/admin/deployments';
import { DetailField } from '@vritti/quantum-ui/DetailField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { zodResolver } from '@vritti/quantum-ui/zod';
import { KeyRound } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import {
  type Deployment,
  SECRET_AUTH_METHOD_FIELDS,
  SECRET_AUTH_METHODS,
  type UpdateDeploymentData,
  updateDeploymentSchema,
} from '@/schemas/admin/deployments';
import { renderSecretStoreFields } from '../components/configFields';
import { EditableConfigCard } from '../components/EditableConfigCard';
import { buildDeploymentDefaults, deploymentSubmitTransform } from '../forms/deploymentFormConfig';

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function authMethodLabel(method: string) {
  return SECRET_AUTH_METHODS.find((m) => m.value === method)?.label ?? method;
}

interface SecretStoreTabProps {
  deployment: Deployment;
}

export const SecretStoreTab: React.FC<SecretStoreTabProps> = ({ deployment }) => {
  const [editing, setEditing] = useState(false);
  const secretProvider = deployment.secretProvider;

  const form = useForm<UpdateDeploymentData>({
    resolver: zodResolver(updateDeploymentSchema),
    defaultValues: buildDeploymentDefaults(deployment),
  });
  const authMethod = useWatch({ control: form.control, name: 'secretProvider.auth.method' });
  const authFields = authMethod ? (SECRET_AUTH_METHOD_FIELDS[authMethod] ?? []) : [];

  const mutation = useUpdateDeployment({ onSuccess: () => setEditing(false) });
  const onCancel = () => {
    form.reset(buildDeploymentDefaults(deployment));
    setEditing(false);
  };

  const view = secretProvider ? (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <DetailField label="Type" type="string" value={titleCase(secretProvider.type)} />
      <DetailField label="URL" type="string" value={secretProvider.url} mono />
      <DetailField label="Project ID" type="string" value={secretProvider.projectId} mono />
      <DetailField label="Environment" type="string" value={secretProvider.env} mono />
      <DetailField label="Auth Method" type="string" value={authMethodLabel(secretProvider.auth.method)} />
    </div>
  ) : (
    <Typography variant="body2" intent="muted">
      No secret store configured. The agent needs one to fetch this deployment's runtime secrets — click Edit to add it.
    </Typography>
  );

  return (
    <EditableConfigCard
      title="Secret Store"
      description="Where and how the agent fetches this deployment's secrets."
      icon={KeyRound}
      editing={editing}
      onEdit={() => setEditing(true)}
      onCancel={onCancel}
      form={form}
      mutation={mutation}
      transformSubmit={(data) => deploymentSubmitTransform(deployment, data)}
      view={view}
    >
      {renderSecretStoreFields({ authFields, existing: !!secretProvider })}
    </EditableConfigCard>
  );
};
