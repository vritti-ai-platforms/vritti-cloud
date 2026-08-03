import { useUpdateDeployment } from '@hooks/admin/deployments';
import { Badge } from '@vritti/quantum-ui/Badge';
import { CopyField } from '@vritti/quantum-ui/CopyField';
import { DetailField } from '@vritti/quantum-ui/DetailField';
import { Select } from '@vritti/quantum-ui/Select';
import { CloudProviderSelector } from '@vritti/quantum-ui/selects/cloud-provider';
import { RegionSelector } from '@vritti/quantum-ui/selects/region';
import { VersionSelector } from '@vritti/quantum-ui/selects/version';
import { TextField } from '@vritti/quantum-ui/TextField';
import { zodResolver } from '@vritti/quantum-ui/zod';
import { Server } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  DEPLOYMENT_STATUS_OPTIONS,
  DEPLOYMENT_STATUS_VARIANT,
  DEPLOYMENT_TENANT_TYPE_OPTIONS,
  DEPLOYMENT_TYPE_OPTIONS,
  type Deployment,
  type UpdateDeploymentData,
  updateDeploymentSchema,
} from '@/schemas/admin/deployments';
import { EditableConfigCard } from '../components/EditableConfigCard';
import { buildDeploymentDefaults, deploymentSubmitTransform } from '../forms/deploymentFormConfig';

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

interface OverviewTabProps {
  deployment: Deployment;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ deployment }) => {
  const isManual = deployment.managementMode === 'manual';
  const [editing, setEditing] = useState(false);

  const form = useForm<UpdateDeploymentData>({
    resolver: zodResolver(updateDeploymentSchema),
    defaultValues: buildDeploymentDefaults(deployment),
  });

  const mutation = useUpdateDeployment({ onSuccess: () => setEditing(false) });
  const onCancel = () => {
    form.reset(buildDeploymentDefaults(deployment));
    setEditing(false);
  };

  const view = (
    <div className="space-y-6">
      <div className="space-y-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Connection</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CopyField label="Endpoint URL" value={deployment.url} />
          <CopyField label="Deployment ID" description="DEPLOYMENT_ID" value={deployment.id} />
        </div>
      </div>
      <div className="space-y-4 border-t pt-6">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Details</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DetailField label="Version" type="string" value={deployment.version} mono />
          <DetailField
            label="Status"
            type="string"
            value={<Badge variant={DEPLOYMENT_STATUS_VARIANT[deployment.status]}>{titleCase(deployment.status)}</Badge>}
          />
          <DetailField label="Type" type="string" value={titleCase(deployment.type)} />
          <DetailField label="Tenancy" type="string" value={titleCase(deployment.tenantType)} />
          <DetailField label="Management Mode" type="string" value={titleCase(deployment.managementMode)} />
          {!isManual && <DetailField label="Region" type="string" value={deployment.regionName} />}
          {!isManual && <DetailField label="Cloud Provider" type="string" value={deployment.cloudProviderName} />}
          <DetailField label="Organizations" type="number" value={deployment.organizationCount ?? 0} />
          <DetailField label="Created" type="date" value={deployment.createdAt} />
        </div>
      </div>
    </div>
  );

  return (
    <EditableConfigCard
      title="Deployment details"
      description="Connection endpoints and runtime configuration for this deployment."
      icon={Server}
      editing={editing}
      onEdit={() => setEditing(true)}
      onCancel={onCancel}
      form={form}
      mutation={mutation}
      transformSubmit={(data) => deploymentSubmitTransform(deployment, data)}
      view={view}
    >
      <TextField name="name" label="Deployment Name" placeholder="e.g. US East Production" />
      <TextField name="url" label="URL" placeholder="https://nexus-us-east.vrittiai.com" />
      {!isManual && (
        <>
          <RegionSelector
            name="regionId"
            label="Region"
            placeholder="Select region"
            onOptionSelect={() => form.setValue('cloudProviderId', '')}
          />
          <CloudProviderSelector name="cloudProviderId" label="Cloud Provider" placeholder="Select provider" />
        </>
      )}
      <VersionSelector name="version" label="Version" placeholder="Select version" />
      <Select
        name="type"
        label="Deployment Type"
        description="Deployed routes core through an edge at api.<host>; local reaches core directly on the URL above."
        options={DEPLOYMENT_TYPE_OPTIONS}
      />
      <Select name="tenantType" label="Tenancy" options={DEPLOYMENT_TENANT_TYPE_OPTIONS} />
      <Select name="status" label="Status" options={DEPLOYMENT_STATUS_OPTIONS} />
    </EditableConfigCard>
  );
};
