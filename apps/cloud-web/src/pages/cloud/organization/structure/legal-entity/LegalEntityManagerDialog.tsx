import { Dialog } from '@vritti/quantum-ui/Dialog';
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
  MeasuringStrategy,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from '@vritti/quantum-ui/dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@vritti/quantum-ui/dnd-kit/sortable';
import type { DialogHandle } from '@vritti/quantum-ui/hooks';
import { CornerDownRight, Landmark, MoveVertical } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useOptimisticStructure } from '@/hooks/cloud/org-structure';
import type { LegalEntity } from '@/schemas/cloud/org-structure';
import { reorderLegalEntities, updateLegalEntity } from '@/services/cloud/org-structure.service';
import { LegalEntityTreeRow } from './tree/LegalEntityTreeRow';
import {
  type DropMode,
  flattenLegalEntities,
  removeChildrenOf,
  resolveDrop,
  SORT_STEP,
} from './tree/legal-entity-tree';
import { RootDropZone } from './tree/RootDropZone';

const ROOT_DROPPABLE_ID = '__le-root__';

interface DropState {
  overId: string | null;
  mode: DropMode;
}

interface LegalEntityTreeProps {
  orgId: string;
  legalEntities: LegalEntity[];
}

// Sortable, collapsible LE tree
const LegalEntityTree = ({ orgId, legalEntities }: LegalEntityTreeProps) => {
  const commit = useOptimisticStructure(orgId);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [drop, setDrop] = useState<DropState | null>(null);
  const [nestHeld, setNestHeld] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());

  const sensors = useSensors(useSensor(PointerSensor));

  const pointerStartY = useRef(0);
  const nestKey = useRef(false);
  const lastMove = useRef<{ overId: string; ratio: number } | null>(null);

  const applyRowDrop = useCallback((overId: string, ratio: number) => {
    const mode: DropMode = nestKey.current ? 'nest' : ratio < 0.5 ? 'before' : 'after';
    setDrop({ overId, mode });
  }, []);

  const handleModifierKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.key !== 'Shift') return;
      nestKey.current = event.type === 'keydown';
      setNestHeld(nestKey.current);
      const move = lastMove.current;
      if (move) applyRowDrop(move.overId, move.ratio);
    },
    [applyRowDrop],
  );

  const flattenedItems = useMemo(() => {
    const flattened = flattenLegalEntities(legalEntities, collapsed);
    return activeId ? removeChildrenOf(flattened, [activeId]) : flattened;
  }, [legalEntities, collapsed, activeId]);

  const sortedIds = useMemo(() => flattenedItems.map((item) => item.id), [flattenedItems]);

  const collisionDetection = useCallback((args: Parameters<typeof pointerWithin>[0]) => {
    const pointerCollisions = pointerWithin(args);
    return pointerCollisions.length > 0 ? pointerCollisions : closestCenter(args);
  }, []);

  const resetState = useCallback(() => {
    setActiveId(null);
    setDrop(null);
    setNestHeld(false);
    lastMove.current = null;
    nestKey.current = false;
    window.removeEventListener('keydown', handleModifierKey);
    window.removeEventListener('keyup', handleModifierKey);
  }, [handleModifierKey]);

  const handleCollapse = useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const commitReorder = useCallback(
    (ids: string[]) => {
      const orderMap = new Map(ids.map((id, index) => [id, (index + 1) * SORT_STEP]));
      commit(
        (structure) => ({
          ...structure,
          legalEntities: structure.legalEntities.map((le) =>
            orderMap.has(le.id) ? { ...le, sortOrder: orderMap.get(le.id) as number } : le,
          ),
        }),
        () => reorderLegalEntities({ orgId, ids }),
        'Could not update legal entities.',
      );
    },
    [commit, orgId],
  );

  const commitReparent = useCallback(
    (movedId: string, parentId: string | null, ids: string[]) => {
      const orderMap = new Map(ids.map((id, index) => [id, (index + 1) * SORT_STEP]));
      commit(
        (structure) => ({
          ...structure,
          legalEntities: structure.legalEntities.map((le) => {
            if (le.id === movedId) return { ...le, parentId, sortOrder: orderMap.get(le.id) ?? le.sortOrder };
            return orderMap.has(le.id) ? { ...le, sortOrder: orderMap.get(le.id) as number } : le;
          }),
        }),
        async () => {
          await updateLegalEntity({ orgId, leId: movedId, data: { parentId } });
          await reorderLegalEntities({ orgId, ids });
        },
        'Could not update legal entities.',
      );
    },
    [commit, orgId],
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      setActiveId(String(event.active.id));
      setDrop(null);
      lastMove.current = null;
      const activator = event.activatorEvent as PointerEvent;
      pointerStartY.current = typeof activator?.clientY === 'number' ? activator.clientY : 0;
      nestKey.current = activator?.shiftKey === true;
      setNestHeld(nestKey.current);
      window.addEventListener('keydown', handleModifierKey);
      window.addEventListener('keyup', handleModifierKey);
    },
    [handleModifierKey],
  );

  const handleDragMove = useCallback(
    ({ active, over, delta }: DragMoveEvent) => {
      if (!over) {
        lastMove.current = null;
        return setDrop(null);
      }
      const overId = String(over.id);
      if (overId === ROOT_DROPPABLE_ID) {
        lastMove.current = null;
        return setDrop({ overId: null, mode: 'root' });
      }
      if (overId === String(active.id)) {
        lastMove.current = null;
        return setDrop(null);
      }
      const pointerY = pointerStartY.current + delta.y;
      const ratio = (pointerY - over.rect.top) / over.rect.height;
      lastMove.current = { overId, ratio };
      applyRowDrop(overId, ratio);
    },
    [applyRowDrop],
  );

  const handleDragEnd = useCallback(
    ({ active }: DragEndEvent) => {
      const intent = drop;
      resetState();
      if (!intent) return;

      const movedId = String(active.id);
      const resolution = resolveDrop(legalEntities, movedId, intent.overId, intent.mode);
      if (resolution.kind === 'noop') return;
      if (resolution.kind === 'reorder') {
        commitReorder(resolution.ids);
        return;
      }
      commitReparent(movedId, resolution.parentId, resolution.ids);
    },
    [drop, resetState, legalEntities, commitReorder, commitReparent],
  );

  if (legalEntities.length === 0) {
    return (
      <div className="px-6 py-4">
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-10 text-center">
          <Landmark className="size-6 text-muted-foreground/60" aria-hidden />
          <p className="text-sm text-muted-foreground">No legal entities yet.</p>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      autoScroll={false}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onDragCancel={resetState}
    >
      <div className="flex flex-col gap-3 px-6 py-4">
        <GestureLegend />

        {activeId !== null && nestHeld && <RootDropZone id={ROOT_DROPPABLE_ID} active={drop?.mode === 'root'} />}

        <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
          <div className="no-scrollbar flex max-h-[55vh] flex-col gap-1 overflow-y-auto overflow-x-hidden">
            {flattenedItems.map((item) => (
              <LegalEntityTreeRow
                key={item.id}
                id={item.id}
                entity={item.entity}
                depth={item.depth}
                childCount={item.childCount}
                collapsed={item.collapsed}
                nesting={nestHeld}
                dropMode={
                  drop && drop.overId === item.id && drop.mode !== 'root'
                    ? (drop.mode as Exclude<DropMode, 'root'>)
                    : null
                }
                onCollapse={handleCollapse}
              />
            ))}
          </div>
        </SortableContext>
      </div>
    </DndContext>
  );
};

// Compact how-to bar for the two gestures
const GestureLegend = () => (
  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
    <span className="inline-flex items-center gap-1.5">
      <MoveVertical className="size-3.5 text-primary" aria-hidden />
      Drag to <span className="font-medium text-foreground">reorder</span>
    </span>
    <span className="inline-flex items-center gap-1.5">
      <CornerDownRight className="size-3.5 text-primary" aria-hidden />
      Hold
      <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] font-semibold text-foreground">
        Shift
      </kbd>
      and drop on a row to <span className="font-medium text-foreground">nest</span>
    </span>
  </div>
);

interface LegalEntityManagerDialogProps {
  handle: DialogHandle;
  orgId: string;
  legalEntities: LegalEntity[];
}

// Dialog to manage the legal-entity hierarchy
export const LegalEntityManagerDialog = ({ handle, orgId, legalEntities }: LegalEntityManagerDialogProps) => (
  <Dialog
    handle={handle}
    icon={Landmark}
    title="Manage Legal Entities"
    description="Drag to reorder. Hold Shift and drop onto a row to nest it as a subsidiary."
    className="max-w-2xl"
    content={() => <LegalEntityTree orgId={orgId} legalEntities={legalEntities} />}
  />
);
