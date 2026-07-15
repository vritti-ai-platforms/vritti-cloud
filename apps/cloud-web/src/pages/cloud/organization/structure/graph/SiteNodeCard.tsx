import { Badge } from '@vritti/quantum-ui/Badge';
import { Button } from '@vritti/quantum-ui/Button';
import { Handle, type Node, type NodeProps, Position } from '@vritti/quantum-ui/react-flow';
import type { SiteType } from '@vritti/quantum-ui/types/catalog-resolver';
import { Building2, Clock, Factory, type LucideIcon, ReceiptText, Settings, Store, Warehouse } from 'lucide-react';
import { SITE_TYPE_LABELS } from '@/schemas/cloud/org-sites';
import { useStructureActions } from '../StructureActionsContext';

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

// Formats an IANA zone as its short GMT offset, e.g. "GMT+5:30"
function timezoneOffset(timeZone: string): string | null {
  try {
    const label = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'shortOffset' })
      .formatToParts(new Date())
      .find((part) => part.type === 'timeZoneName')?.value;
    return label ?? null;
  } catch {
    return null;
  }
}

export interface SiteNodeData extends Record<string, unknown> {
  id: string;
  name: string;
  code: string;
  type: SiteType;
  timezone: string;
  groupId: string | null;
  registrationChip?: string | null;
  groupName?: string | null;
}

// Transacting site card
export const SiteNodeCard = ({ data }: NodeProps<Node<SiteNodeData>>) => {
  const actions = useStructureActions();
  const style = TYPE_STYLES[data.type] ?? FALLBACK_STYLE;
  const Icon = style.icon;
  const offset = timezoneOffset(data.timezone);

  return (
    <div className="group relative w-75 cursor-grab overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing">
      <div className={`absolute inset-y-0 left-0 w-1 ${style.rail}`} />
      <Handle type="target" position={Position.Top} className="opacity-0! w-1! h-1! min-w-0! min-h-0! border-0!" />

      {/* Identity zone — icon, name, code, per-type badge, group membership */}
      <div className="p-4 pl-4.5">
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

          <Button
            variant="ghost"
            size="icon"
            className="nodrag nopan size-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              actions.openDetail('site', data.id, data.name);
            }}
          >
            <Settings className="size-3.5" />
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary" className={`text-xs ${style.badge}`}>
            {SITE_TYPE_LABELS[data.type] ?? 'Site'}
          </Badge>
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

      {/* Operational spec strip — tax registration (how it bills) and timezone (what clock it runs on) */}
      <div className="space-y-2 border-t border-border/60 bg-muted/30 px-4 py-2.5 pl-4.5">
        <div className="flex items-center gap-2">
          <ReceiptText className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="w-16 shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Tax reg
          </span>
          {data.registrationChip ? (
            <span className="truncate font-mono text-xs font-medium text-foreground">{data.registrationChip}</span>
          ) : (
            <span className="text-xs italic text-muted-foreground">Not registered</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Clock className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="w-16 shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Timezone
          </span>
          <span className="flex min-w-0 items-baseline gap-1.5">
            <span className="truncate text-xs font-medium text-foreground">{data.timezone}</span>
            {offset && <span className="shrink-0 font-mono text-[10px] text-muted-foreground">{offset}</span>}
          </span>
        </div>
      </div>
    </div>
  );
};
