import { useDeploymentActivity } from '@hooks/admin/deployments';
import type React from 'react';
import { EventTimeline } from '../components/EventTimeline';

interface ActivityTabProps {
  deploymentId: string;
}

// The managed deployment's Activity tab — the reconcile/licensing timeline, seeded over HTTP and streamed
// live via its own SSE (useDeploymentActivity). Owns its data independently of the agent status stream.
export const ActivityTab: React.FC<ActivityTabProps> = ({ deploymentId }) => {
  const { events, isLoading } = useDeploymentActivity(deploymentId);
  return <EventTimeline events={events} isLoading={isLoading} />;
};
