import { Badge } from '@vritti/quantum-ui/Badge';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import type { DialogHandle } from '@vritti/quantum-ui/hooks';
import { SortableDragHandle, SortableItem, SortableList } from '@vritti/quantum-ui/Sortable';
import type { SiteType } from '@vritti/quantum-ui/types/catalog-resolver';
import { Building2, Factory, GripVertical, type LucideIcon, Store, Warehouse } from 'lucide-react';
import { useCallback } from 'react';
import { useOptimisticStructure } from '@/hooks/cloud/org-structure';
import { SITE_TYPE_LABELS } from '@/schemas/cloud/org-sites';
import type { LegalEntity, StructureSite } from '@/schemas/cloud/org-structure';
import { reorderSites } from '@/services/cloud/org-sites.service';
import { bySortOrder } from '../shared/sort';

const SORT_STEP = 1;

interface TypeStyle {
  icon: LucideIcon;
  iconWrap: string;
  badge: string;
}

const TYPE_STYLES: Record<SiteType, TypeStyle> = {
  OUTLET: {
    icon: Store,
    iconWrap: 'bg-success/15 text-success',
    badge: 'bg-success/15 text-success border-success/25',
  },
  WAREHOUSE: { icon: Warehouse, iconWrap: 'bg-info/15 text-info', badge: 'bg-info/15 text-info border-info/25' },
  PRODUCTION: {
    icon: Factory,
    iconWrap: 'bg-primary/15 text-primary',
    badge: 'bg-primary/15 text-primary border-primary/25',
  },
};

const FALLBACK_STYLE: TypeStyle = {
  icon: Building2,
  iconWrap: 'bg-muted text-muted-foreground',
  badge: 'bg-muted text-muted-foreground border-border',
};

interface SiteOrderListProps {
  orgId: string;
  sites: StructureSite[];
}

// Vertical sortable list of a legal entity's sites
const SiteOrderList = ({ orgId, sites }: SiteOrderListProps) => {
  const commit = useOptimisticStructure(orgId);
  const ordered = [...sites].sort(bySortOrder);

  const handleReorder = useCallback(
    (next: StructureSite[]) => {
      const ids = next.map((site) => site.id);
      const originalSeq = [...sites].sort(bySortOrder).map((site) => site.id);
      if (ids.every((id, index) => id === originalSeq[index])) return;

      const orderMap = new Map(ids.map((id, index) => [id, (index + 1) * SORT_STEP]));
      commit(
        (structure) => ({
          ...structure,
          sites: structure.sites.map((site) =>
            orderMap.has(site.id) ? { ...site, sortOrder: orderMap.get(site.id) as number } : site,
          ),
        }),
        () => reorderSites({ orgId, ids }),
        'Could not reorder sites.',
      );
    },
    [orgId, sites, commit],
  );

  return (
    <div className="no-scrollbar max-h-[55vh] overflow-y-auto overflow-x-hidden px-6 py-4">
      <SortableList items={ordered} onReorder={handleReorder} strategy="vertical" className="flex flex-col gap-1.5">
        {ordered.map((site) => {
          const style = TYPE_STYLES[site.type] ?? FALLBACK_STYLE;
          const Icon = style.icon;
          return (
            <SortableItem key={site.id} id={site.id}>
              <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5">
                <SortableDragHandle>
                  <GripVertical className="size-4" />
                </SortableDragHandle>
                <div className={`flex size-8 shrink-0 items-center justify-center rounded-md ${style.iconWrap}`}>
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold leading-tight">{site.name}</p>
                  {site.code && <span className="font-mono text-xs text-muted-foreground">{site.code}</span>}
                </div>
                <Badge variant="secondary" className={`shrink-0 text-xs ${style.badge}`}>
                  {SITE_TYPE_LABELS[site.type] ?? 'Site'}
                </Badge>
              </div>
            </SortableItem>
          );
        })}
      </SortableList>
    </div>
  );
};

interface SiteOrderDialogProps {
  handle: DialogHandle;
  orgId: string;
  legalEntity: LegalEntity | null;
  sites: StructureSite[];
}

// Dialog to set the order of a legal entity's sites
export const SiteOrderDialog = ({ handle, orgId, legalEntity, sites }: SiteOrderDialogProps) => (
  <Dialog
    handle={handle}
    icon={GripVertical}
    title={`Reorder Sites${legalEntity ? ` — ${legalEntity.name}` : ''}`}
    description="Drag to set the order sites appear under this legal entity."
    className="max-w-lg"
    content={() =>
      sites.length < 2 ? (
        <div className="px-6 py-4">
          <div className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
            Nothing to reorder — this legal entity has fewer than two sites.
          </div>
        </div>
      ) : (
        <SiteOrderList orgId={orgId} sites={sites} />
      )
    }
  />
);
