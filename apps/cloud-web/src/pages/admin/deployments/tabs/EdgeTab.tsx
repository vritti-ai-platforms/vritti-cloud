import { useUpdateDeployment } from '@hooks/admin/deployments';
import { Badge } from '@vritti/quantum-ui/Badge';
import { DetailField } from '@vritti/quantum-ui/DetailField';
import { Typography } from '@vritti/quantum-ui/Typography';
import { zodResolver } from '@vritti/quantum-ui/zod';
import { Lock } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { type Deployment, type UpdateDeploymentData, updateDeploymentSchema } from '@/schemas/admin/deployments';
import { renderEdgeFields } from '../components/configFields';
import { EditableConfigCard } from '../components/EditableConfigCard';
import { buildDeploymentDefaults, deploymentSubmitTransform } from '../forms/deploymentFormConfig';

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

interface EdgeTabProps {
  deployment: Deployment;
}

export const EdgeTab: React.FC<EdgeTabProps> = ({ deployment }) => {
  const [editing, setEditing] = useState(false);

  const form = useForm<UpdateDeploymentData>({
    resolver: zodResolver(updateDeploymentSchema),
    defaultValues: buildDeploymentDefaults(deployment),
  });
  const edge = useWatch({ control: form.control, name: 'edge' });
  const managed = edge === 'managed';

  const mutation = useUpdateDeployment({ onSuccess: () => setEditing(false) });
  const onCancel = () => {
    form.reset(buildDeploymentDefaults(deployment));
    setEditing(false);
  };

  const view = (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DetailField
          label="Edge (nginx + TLS)"
          type="string"
          value={
            <Badge variant={deployment.edge === 'managed' ? 'success' : 'secondary'}>
              {titleCase(deployment.edge)}
            </Badge>
          }
        />
        {deployment.edge === 'managed' && (
          <DetailField label="ACME Email" type="string" value={deployment.acmeEmail} mono />
        )}
      </div>
      {deployment.edge === 'managed' ? (
        <Typography variant="body2" intent="muted">
          The agent issues one <span className="font-mono">*.{'{base}'}</span> wildcard via DNS-01 and derives routing
          automatically (<span className="font-mono">api.</span> → core-server, <span className="font-mono">git.</span>{' '}
          → gitea, <span className="font-mono">*.</span> → core-web). Certificate status is on the Agent tab.
        </Typography>
      ) : (
        <Typography variant="body2" intent="muted">
          Another proxy/ingress fronts core — the agent runs no nginx and issues no certificate.
        </Typography>
      )}
    </div>
  );

  return (
    <EditableConfigCard
      title="Edge & TLS"
      description="How HTTP traffic is fronted, and the wildcard certificate."
      icon={Lock}
      editing={editing}
      onEdit={() => setEditing(true)}
      onCancel={onCancel}
      form={form}
      mutation={mutation}
      transformSubmit={(data) => deploymentSubmitTransform(deployment, data)}
      view={view}
    >
      {renderEdgeFields({ managed })}
    </EditableConfigCard>
  );
};
