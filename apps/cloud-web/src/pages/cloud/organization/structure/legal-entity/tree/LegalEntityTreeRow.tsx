import { cn } from '@vritti/quantum-ui/cn';
import { useSortable } from '@vritti/quantum-ui/dnd-kit/sortable';
import { CSS } from '@vritti/quantum-ui/dnd-kit/utilities';
import { countryFlag } from '@vritti/quantum-ui/selects/iso-country';
import { ChevronRight, GripVertical } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { LegalEntity } from '@/schemas/cloud/org-structure';
import { type DropMode, INDENTATION_WIDTH } from './legal-entity-tree';

interface LegalEntityTreeRowProps {
  id: string;
  entity: LegalEntity;
  depth: number;
  childCount: number;
  collapsed: boolean;
  dropMode?: Exclude<DropMode, 'root'> | null;
  nesting?: boolean;
  onCollapse: (id: string) => void;
}

// One draggable row in the LE tree
export const LegalEntityTreeRow = ({
  id,
  entity,
  depth,
  childCount,
  collapsed,
  dropMode,
  nesting,
  onCollapse,
}: LegalEntityTreeRowProps) => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const frozen = nesting && !isDragging;
  const style: CSSProperties = {
    transform: frozen ? undefined : CSS.Translate.toString(transform),
    transition: frozen ? undefined : transition,
    paddingLeft: depth * INDENTATION_WIDTH,
  };

  const flag = countryFlag(entity.country);
  const isNest = dropMode === 'nest';

  return (
    <div ref={setNodeRef} style={style} className={cn('group/row relative', isDragging && 'opacity-40')}>
      {Array.from({ length: depth }).map((_, level) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed positional rails
          key={level}
          aria-hidden
          className="absolute -top-1 bottom-0 w-px bg-border"
          style={{ left: level * INDENTATION_WIDTH + 15 }}
        />
      ))}

      {/* Reorder insertion markers */}
      {dropMode === 'before' && <InsertionLine className="-top-0.5" />}
      {dropMode === 'after' && <InsertionLine className="-bottom-0.5" />}

      <div
        className={cn(
          'flex items-center gap-2 rounded-lg border px-2 py-2 transition-colors',
          isNest
            ? 'border-primary bg-primary/10 ring-1 ring-primary'
            : 'border-border bg-card hover:border-primary/40 hover:bg-accent/50',
        )}
      >
        <button
          ref={setActivatorNodeRef}
          type="button"
          aria-label="Drag to reorder or nest"
          className="flex size-6 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground/40 transition-colors group-hover/row:text-muted-foreground active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>

        {childCount > 0 ? (
          <button
            type="button"
            aria-label={collapsed ? 'Expand' : 'Collapse'}
            onClick={() => onCollapse(id)}
            className="flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-muted"
          >
            <ChevronRight className={cn('size-4 transition-transform', !collapsed && 'rotate-90')} />
          </button>
        ) : (
          <span className="size-5 shrink-0" aria-hidden />
        )}

        <span
          className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-sm leading-none"
          aria-hidden
        >
          {flag || '🏛'}
        </span>

        <span className="truncate text-sm font-medium text-foreground">{entity.name}</span>
        <span className="shrink-0 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
          {entity.code}
        </span>

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          {entity.currencyCode && (
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-muted-foreground">
              {entity.currencyCode}
            </span>
          )}
          {childCount > 0 && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              {childCount} sub{childCount === 1 ? '' : 's'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Primary insertion guide with a leading node
const InsertionLine = ({ className }: { className?: string }) => (
  <div className={cn('absolute right-1 left-8 z-10 flex items-center gap-1', className)} aria-hidden>
    <span className="size-1.5 rounded-full bg-primary" />
    <span className="h-0.5 flex-1 rounded-full bg-primary" />
  </div>
);
