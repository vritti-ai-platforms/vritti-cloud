import { Badge } from '@vritti/quantum-ui/Badge';
import { cn } from '@vritti/quantum-ui/cn';
import type { LucideIcon } from 'lucide-react';
import type React from 'react';

interface ComponentCardProps {
  icon: LucideIcon;
  name: string;
  subtitle: string;
  fact: string;
  enabled: boolean;
  health: { variant: 'success' | 'warning' | 'destructive' | 'secondary'; label: string };
  onClick: () => void;
}

// One tile in the cockpit component grid — drills into that component's full-page view. Dimmed when the
// component is off (available to enable).
export const ComponentCard: React.FC<ComponentCardProps> = ({
  icon: Icon,
  name,
  subtitle,
  fact,
  enabled,
  health,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'flex flex-col gap-3 rounded-xl border p-4 text-left transition-colors hover:border-primary/40 hover:bg-muted/40',
      !enabled && 'bg-muted/40',
    )}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-lg',
            enabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
          )}
        >
          <Icon className="size-5" />
        </div>
        <div>
          <p className="font-semibold leading-tight">{name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <Badge variant={enabled ? health.variant : 'secondary'}>{enabled ? health.label : 'Off'}</Badge>
    </div>
    <p className="text-xs text-muted-foreground">{fact}</p>
  </button>
);
