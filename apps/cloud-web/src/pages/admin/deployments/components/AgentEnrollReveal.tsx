import { Alert } from '@vritti/quantum-ui/Alert';
import { CopyField } from '@vritti/quantum-ui/CopyField';
import { DetailField } from '@vritti/quantum-ui/DetailField';
import { Typography } from '@vritti/quantum-ui/Typography';
import type React from 'react';
import type { EnrollToken } from '@/schemas/admin/deployments';

interface AgentEnrollRevealProps {
  enrollToken: EnrollToken;
  deploymentId: string;
}

export const AgentEnrollReveal: React.FC<AgentEnrollRevealProps> = ({ enrollToken, deploymentId }) => (
  <div className="space-y-4">
    <Alert
      variant="warning"
      title="Shown only once"
      description="This enroll token cannot be retrieved again. Paste the values below on the deployment VM. You can regenerate a new token anytime."
    />

    <CopyField label="Cloud API URL" description="VRITTI_CLOUD_API_URL" value={enrollToken.cloudApiUrl} />
    <CopyField label="Deployment ID" description="VRITTI_DEPLOYMENT_ID" value={deploymentId} />
    <CopyField label="Enroll token" description="VRITTI_ENROLL_TOKEN" value={enrollToken.token} mono />

    <DetailField label="Token expires" type="dateTime" value={enrollToken.expiresAt} />

    <Typography variant="body2" intent="muted">
      Set VRITTI_CLOUD_API_URL, VRITTI_DEPLOYMENT_ID, and VRITTI_ENROLL_TOKEN in the agent's environment on the
      deployment VM, then start the agent so it enrolls and connects back to cloud.
    </Typography>
  </div>
);
