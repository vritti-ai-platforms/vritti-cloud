import type { LegalEntity } from '@/schemas/cloud/org-structure';
import { bySortOrder } from '../../shared/sort';

export const INDENTATION_WIDTH = 24;

export const SORT_STEP = 1;

// Drop intent while dragging a row
export type DropMode = 'nest' | 'before' | 'after' | 'root';

export interface FlattenedLegalEntity {
  id: string;
  parentId: string | null;
  depth: number;
  index: number;
  collapsed: boolean;
  childCount: number;
  entity: LegalEntity;
}

// Effective parent id, treating a missing parent as root
export function effectiveParentId(le: LegalEntity, byId: Map<string, LegalEntity>): string | null {
  return le.parentId && byId.has(le.parentId) ? le.parentId : null;
}

// Group LEs by effective parent, each bucket sorted
function childrenByParent(legalEntities: LegalEntity[]): Map<string | null, LegalEntity[]> {
  const byId = new Map(legalEntities.map((le) => [le.id, le]));
  const buckets = new Map<string | null, LegalEntity[]>();
  for (const le of legalEntities) {
    const parent = effectiveParentId(le, byId);
    const bucket = buckets.get(parent);
    if (bucket) bucket.push(le);
    else buckets.set(parent, [le]);
  }
  for (const bucket of buckets.values()) bucket.sort(bySortOrder);
  return buckets;
}

// Depth-first flatten of the LE forest into visible rows
export function flattenLegalEntities(legalEntities: LegalEntity[], collapsed: Set<string>): FlattenedLegalEntity[] {
  const buckets = childrenByParent(legalEntities);
  const result: FlattenedLegalEntity[] = [];

  const walk = (parentId: string | null, depth: number) => {
    const children = buckets.get(parentId) ?? [];
    children.forEach((entity, index) => {
      const childCount = (buckets.get(entity.id) ?? []).length;
      const isCollapsed = collapsed.has(entity.id);
      result.push({ id: entity.id, parentId, depth, index, collapsed: isCollapsed, childCount, entity });
      if (childCount > 0 && !isCollapsed) walk(entity.id, depth + 1);
    });
  };

  walk(null, 0);
  return result;
}

// Drop every descendant of the given parent ids
export function removeChildrenOf(items: FlattenedLegalEntity[], ids: string[]): FlattenedLegalEntity[] {
  const excluded = [...ids];
  return items.filter((item) => {
    if (item.parentId && excluded.includes(item.parentId)) {
      if (item.childCount > 0) excluded.push(item.id);
      return false;
    }
    return true;
  });
}

// Ordered child ids of a parent
export function siblingOrder(legalEntities: LegalEntity[], parentId: string | null): string[] {
  const byId = new Map(legalEntities.map((le) => [le.id, le]));
  return legalEntities
    .filter((le) => effectiveParentId(le, byId) === parentId)
    .sort(bySortOrder)
    .map((le) => le.id);
}

// Effective parent of an LE id, or null
export function parentOf(legalEntities: LegalEntity[], id: string): string | null {
  const byId = new Map(legalEntities.map((le) => [le.id, le]));
  const le = byId.get(id);
  return le ? effectiveParentId(le, byId) : null;
}

const arraysEqual = (a: string[], b: string[]): boolean =>
  a.length === b.length && a.every((value, index) => value === b[index]);

export interface DropResolution {
  kind: 'reorder' | 'reparent-reorder' | 'noop';
  parentId: string | null;
  ids: string[];
}

// Resolve a drop into the persistence intent
export function resolveDrop(
  legalEntities: LegalEntity[],
  movedId: string,
  overId: string | null,
  mode: DropMode,
): DropResolution {
  const previousParentId = parentOf(legalEntities, movedId);

  let targetParentId: string | null;
  if (mode === 'root') targetParentId = null;
  else if (mode === 'nest') {
    if (!overId) return { kind: 'noop', parentId: previousParentId, ids: [] };
    targetParentId = overId;
  } else {
    if (!overId) return { kind: 'noop', parentId: previousParentId, ids: [] };
    targetParentId = parentOf(legalEntities, overId);
  }

  const base = siblingOrder(legalEntities, targetParentId).filter((id) => id !== movedId);
  let ids: string[];
  if (mode === 'nest' || mode === 'root') {
    ids = [...base, movedId];
  } else {
    const anchorIndex = base.indexOf(overId as string);
    const insertAt = mode === 'before' ? anchorIndex : anchorIndex + 1;
    ids = [...base.slice(0, insertAt), movedId, ...base.slice(insertAt)];
  }

  const parentChanged = (previousParentId ?? null) !== (targetParentId ?? null);
  if (!parentChanged) {
    if (arraysEqual(siblingOrder(legalEntities, targetParentId), ids)) {
      return { kind: 'noop', parentId: targetParentId, ids };
    }
    return { kind: 'reorder', parentId: targetParentId, ids };
  }
  return { kind: 'reparent-reorder', parentId: targetParentId, ids };
}
