import { useUpdateDeployment } from '@hooks/admin/deployments';
import { Badge } from '@vritti/quantum-ui/Badge';
import { CopyField } from '@vritti/quantum-ui/CopyField';
import { DetailField } from '@vritti/quantum-ui/DetailField';
import { Select } from '@vritti/quantum-ui/Select';
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
  type Deployment,
  type UpdateDeploymentData,
  updateDeploymentSchema,
} from '@/schemas/admin/deployments';
import { EditableConfigCard } from '../../components/EditableConfigCard';
import { buildDeploymentDefaults, deploymentSubmitTransform } from '../../forms/deploymentFormConfig';
import { EventTimeline } from '../cockpit/EventTimeline';

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

interface LocalOverviewTabProps {
  deployment: Deployment;
}

// The manual deployment's Overview tab: an editable connection card + the licensing activity timeline.
export const LocalOverviewTab: React.FC<LocalOverviewTabProps> = ({ deployment }) => {
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CopyField label="Endpoint URL" value={deployment.url} />
        <CopyField label="Deployment ID" description="DEPLOYMENT_ID" value={deployment.id} />
      </div>
      <div className="grid grid-cols-1 gap-4 border-t pt-6 sm:grid-cols-2 lg:grid-cols-3">
        <DetailField label="Version" type="string" value={deployment.version} mono />
        <DetailField
          label="Status"
          type="string"
          value={<Badge variant={DEPLOYMENT_STATUS_VARIANT[deployment.status]}>{titleCase(deployment.status)}</Badge>}
        />
        <DetailField label="Management Type" type="string" value={<Badge variant="secondary">Manual</Badge>} />
        <DetailField label="Tenancy" type="string" value={titleCase(deployment.tenantType)} />
        <DetailField label="Organizations" type="number" value={deployment.organizationCount} />
        <DetailField label="Created" type="date" value={deployment.createdAt} />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <EditableConfigCard
        title="Connection"
        description="How this self-hosted deployment is addressed."
        icon={Server}
        editing={editing}
        onEdit={() => setEditing(true)}
        onCancel={onCancel}
        form={form}
        mutation={mutation}
        transformSubmit={(data) => deploymentSubmitTransform(deployment, data)}
        view={view}
      >
        <TextField name="name" label="Deployment Name" placeholder="e.g. Acme On-Prem" />
        <TextField name="url" label="Endpoint URL" placeholder="https://vritti.acme.internal" />
        <VersionSelector name="version" label="Version" placeholder="Select version" />
        <Select name="tenantType" label="Tenancy" options={DEPLOYMENT_TENANT_TYPE_OPTIONS} />
        <Select name="status" label="Status" options={DEPLOYMENT_STATUS_OPTIONS} />
      </EditableConfigCard>

      <EventTimeline
        deploymentId={deployment.id}
        title="Licensing activity"
        description="The only events cloud records for a self-hosted deployment."
      />
    </div>
  );
};
