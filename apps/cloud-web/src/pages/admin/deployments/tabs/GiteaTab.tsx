import { useUpdateDeployment } from '@hooks/admin/deployments';
import { Badge } from '@vritti/quantum-ui/Badge';
import { DetailField } from '@vritti/quantum-ui/DetailField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { zodResolver } from '@vritti/quantum-ui/zod';
import { GitBranch } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { type Deployment, type UpdateDeploymentData, updateDeploymentSchema } from '@/schemas/admin/deployments';
import { renderGiteaField } from '../components/configFields';
import { EditableConfigCard } from '../components/EditableConfigCard';
import { buildDeploymentDefaults, deploymentSubmitTransform } from '../forms/deploymentFormConfig';

interface GiteaTabProps {
  deployment: Deployment;
}

export const GiteaTab: React.FC<GiteaTabProps> = ({ deployment }) => {
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

  const view = deployment.addonGitea ? (
    <div className="space-y-4">
      <DetailField label="Status" type="string" value={<Badge variant="success">Enabled</Badge>} />
      <Typography variant="body2" intent="muted">
        The agent runs a self-hosted Gitea server (backed by the core DB in a <span className="font-mono">gitea</span>{' '}
        schema), provisions its admin + API token, and core-server creates the app git user + PAT. Served at{' '}
        <span className="font-mono">git.{'{base}'}</span> with git SSH on <span className="font-mono">:2222</span>.
      </Typography>
    </div>
  ) : (
    <Typography variant="body2" intent="muted">
      Gitea is disabled. Enable it to run a self-hosted Git service for GitOps configuration.
    </Typography>
  );

  return (
    <EditableConfigCard
      title="Gitea"
      description="Optional self-hosted Git service."
      icon={GitBranch}
      editing={editing}
      onEdit={() => setEditing(true)}
      onCancel={onCancel}
      form={form}
      mutation={mutation}
      transformSubmit={(data) => deploymentSubmitTransform(deployment, data)}
      view={view}
    >
      {renderGiteaField()}
    </EditableConfigCard>
  );
};
