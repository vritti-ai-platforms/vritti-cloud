import { Alert } from '@vritti/quantum-ui/Alert';
import type React from 'react';
import type { AgentStatus, Condition } from '@/schemas/admin/deployments';

type AlertVariant = 'success' | 'warning' | 'destructive' | 'info';

// The single most important active condition to surface, in severity order.
function primaryCondition(agent: AgentStatus): Condition | undefined {
  const order: Condition['type'][] = ['Degraded', 'Blocked', 'Reconciling', 'Ready'];
  for (const type of order) {
    const found = agent.conditions.find((condition) => condition.type === type && condition.status === 'true');
    if (found) return found;
  }
  return undefined;
}

const VARIANT_BY_TYPE: Record<Condition['type'], AlertVariant> = {
  Ready: 'success',
  Reconciling: 'info',
  Blocked: 'warning',
  Degraded: 'destructive',
};

function titleFor(condition: Condition): string {
  switch (condition.type) {
    case 'Ready':
      return 'Ready — in sync';
    case 'Reconciling':
      return 'Reconciling';
    case 'Blocked':
      return condition.reason === 'AwaitingDnsDelegation' ? 'Blocked — awaiting DNS delegation' : 'Blocked';
    case 'Degraded':
      return 'Degraded';
  }
}

interface ConditionsBannerProps {
  agent: AgentStatus;
}

// The cockpit's top-line reconcile status, driven by the agent's conditions. Blocked/Degraded surface
// their message so operators no longer SSH in to read the reason. When the agent isn't connected, live
// status is unavailable — surface that first.
export const ConditionsBanner: React.FC<ConditionsBannerProps> = ({ agent }) => {
  if (!agent.connected) {
    return (
      <Alert
        variant="destructive"
        title="Agent offline"
        description="The deployment agent isn't connected to cloud. Live status resumes when it reconnects."
      />
    );
  }

  const condition = primaryCondition(agent);
  if (!condition) {
    return <Alert variant="info" title="Waiting for the agent" description="No reconcile status reported yet." />;
  }

  const generation = `Generation ${agent.lastGeneration ?? '—'}`;
  const description = condition.message || `${generation} applied.`;

  return <Alert variant={VARIANT_BY_TYPE[condition.type]} title={titleFor(condition)} description={description} />;
};
