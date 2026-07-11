import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import type { SiteType } from '@vritti/quantum-ui/types/catalog-resolver';
import { Handle, type Node, type NodeProps, Position } from '@xyflow/react';
import { Building2, Factory, type LucideIcon, Settings, Store, Warehouse } from 'lucide-react';
import { SITE_TYPE_LABELS } from '@/schemas/cloud/org-sites';

interface TypeStyle {
  icon: LucideIcon;
  rail: string;
  iconWrap: string;
  badge: string;
}

const TYPE_STYLES: Record<SiteType, TypeStyle> = {
  OUTLET: {
    icon: Store,
    rail: 'bg-success',
    iconWrap: 'bg-success/15 text-success',
    badge: 'bg-success/15 text-success border-success/25',
  },
  WAREHOUSE: {
    icon: Warehouse,
    rail: 'bg-info',
    iconWrap: 'bg-info/15 text-info',
    badge: 'bg-info/15 text-info border-info/25',
  },
  PRODUCTION: {
    icon: Factory,
    rail: 'bg-primary',
    iconWrap: 'bg-primary/15 text-primary',
    badge: 'bg-primary/15 text-primary border-primary/25',
  },
};

const FALLBACK_STYLE: TypeStyle = {
  icon: Building2,
  rail: 'bg-muted-foreground/40',
  iconWrap: 'bg-muted text-muted-foreground',
  badge: 'bg-muted text-muted-foreground border-border',
};

export interface SiteNodeData extends Record<string, unknown> {
  id: string;
  name: string;
  code: string;
  type: SiteType;
  registrationChip?: string | null;
  groupName?: string | null;
  onOpenDetail?: (kind: 'site', id: string, name: string) => void;
}

// Transacting site card — per-type colored rail + icon set it apart from the filled Org node
export const SiteNodeCard = ({ data }: NodeProps<Node<SiteNodeData>>) => {
  const style = TYPE_STYLES[data.type] ?? FALLBACK_STYLE;
  const Icon = style.icon;

  return (
    <div className="group relative w-65 overflow-hidden rounded-lg border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className={`absolute inset-y-0 left-0 w-1 ${style.rail}`} />
      <Handle type="target" position={Position.Top} className="opacity-0! w-1! h-1! min-w-0! min-h-0! border-0!" />

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className={`flex size-8 items-center justify-center rounded-md shrink-0 ${style.iconWrap}`}>
            <Icon className="size-4" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold leading-tight">{data.name}</h3>
            {data.code && <span className="font-mono text-xs text-muted-foreground">{data.code}</span>}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="nodrag nopan size-6"
            onClick={(e) => {
              e.stopPropagation();
              data.onOpenDetail?.('site', data.id, data.name);
            }}
          >
            <Settings className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Chips row — type badge, registration chip, group membership (or an Ungrouped hint) */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Badge variant="secondary" className={`text-xs ${style.badge}`}>
          {SITE_TYPE_LABELS[data.type] ?? 'Site'}
        </Badge>
        {data.registrationChip && (
          <Badge variant="outline" className="font-mono text-xs">
            {data.registrationChip}
          </Badge>
        )}
        {data.groupName ? (
          <Badge variant="outline" className="bg-primary/10 text-xs text-primary border-primary/25">
            {data.groupName}
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-destructive/10 text-xs text-destructive border-destructive/25">
            Ungrouped
          </Badge>
        )}
      </div>
    </div>
  );
};
