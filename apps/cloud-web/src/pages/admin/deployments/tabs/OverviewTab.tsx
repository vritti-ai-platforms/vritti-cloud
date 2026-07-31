import { Badge } from '@vritti/quantum-ui/Badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vritti/quantum-ui/Card';
import { CopyField } from '@vritti/quantum-ui/CopyField';
import { DetailField } from '@vritti/quantum-ui/DetailField';
import { Server } from 'lucide-react';
import type React from 'react';
import type { Deployment } from '@/schemas/admin/deployments';

const DEPLOYMENT_STATUS_VARIANT: Record<Deployment['status'], 'success' | 'warning' | 'secondary'> = {
  active: 'success',
  provisioning: 'warning',
  stopped: 'secondary',
};

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

interface OverviewTabProps {
  deployment: Deployment;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ deployment }) => (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Server className="size-5" />
        </div>
        <div className="space-y-1">
          <CardTitle>Deployment details</CardTitle>
          <CardDescription>Connection endpoints and runtime configuration for this deployment.</CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-6">
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
          <DetailField label="Management Mode" type="string" value={titleCase(deployment.managementMode)} />
          <DetailField label="Organizations" type="number" value={deployment.organizationCount ?? 0} />
          <DetailField label="Created" type="date" value={deployment.createdAt} />
        </div>
      </div>
    </CardContent>
  </Card>
);
