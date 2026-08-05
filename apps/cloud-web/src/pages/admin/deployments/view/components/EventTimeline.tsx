import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vritti/quantum-ui/Card';
import { cn } from '@vritti/quantum-ui/cn';
import { DateTimeCell } from '@vritti/quantum-ui/DataTable';
import { Empty } from '@vritti/quantum-ui/Empty';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';
import { Activity, ScrollText } from 'lucide-react';
import type React from 'react';
import type { DeploymentEvent } from '@/schemas/admin/deployments';

// Marker ring color by event level — semantic tokens only.
function markerClass(level: string): string {
  if (level === 'error') return 'border-destructive';
  if (level === 'warn') return 'border-warning';
  return 'border-success';
}

interface EventTimelineProps {
  events: DeploymentEvent[];
  isLoading: boolean;
  title?: string;
  description?: string;
}

// Presentational reconcile / licensing activity feed. The managed Activity tab feeds it live events from
// useDeploymentActivity (SSE); the local overview feeds it from the same hook. Replaces SSH-to-read-logs.
export const EventTimeline: React.FC<EventTimelineProps> = ({
  events,
  isLoading,
  title = 'Activity',
  description = 'Reconciliation events reported by the agent — no more SSH to read logs.',
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ScrollText className="size-5" />
          </div>
          <div className="space-y-1">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : events.length === 0 ? (
          <Empty
            icon={<Activity />}
            title="No activity yet"
            description="Reconcile events will appear here as they occur."
          />
        ) : (
          <ol className="relative">
            {events.map((event, index) => (
              <li key={event.id} className="relative flex gap-4 pb-5 pl-1 last:pb-0">
                <div className="relative flex flex-col items-center">
                  <span
                    className={cn('mt-1 size-3 shrink-0 rounded-full border-2 bg-background', markerClass(event.level))}
                  />
                  {index < events.length - 1 && <span className="mt-1 w-px flex-1 bg-border" />}
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">{event.reason}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      <DateTimeCell value={event.createdAt} />
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {event.component ? `${event.component} · ` : ''}
                    {event.message}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
};
