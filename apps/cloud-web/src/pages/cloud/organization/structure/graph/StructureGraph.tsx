import { Button } from '@vritti/quantum-ui/Button';
import {
  Background,
  ConnectionLineType,
  Controls,
  type EdgeTypes,
  type Node,
  type NodeProps,
  type OnNodeDrag,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@vritti/quantum-ui/react-flow';
import { toast } from '@vritti/quantum-ui/Sonner';
import { Settings } from 'lucide-react';
import { type ComponentType, useCallback, useEffect, useMemo } from 'react';
import { useOptimisticStructure } from '@/hooks/cloud/org-structure';
import type { OrgStructureResponse, SiteGroup } from '@/schemas/cloud/org-structure';
import { updateOrgSite } from '@/services/cloud/org-sites.service';
import { reorderSiteGroups, reparentSiteGroup } from '@/services/cloud/org-structure.service';
import { useStructureActions } from '../StructureActionsContext';
import { bySortOrder } from '../shared/sort';
import { GroupBandNode } from './GroupBandNode';
import { LEHeaderNode } from './LEHeaderNode';
import { LEPanelNode } from './LEPanelNode';
import { OrgNodeCard } from './OrgNodeCard';
import { SiteGroupNodeCard } from './SiteGroupNodeCard';
import { SiteNodeCard } from './SiteNodeCard';
import { StructureLegend } from './StructureLegend';
import { buildStructureLayout } from './structure-layout';
import { TreeEdge } from './TreeEdge';

import './structure-graph.css';

const nodeTypes = {
  orgNode: OrgNodeCard as ComponentType<NodeProps>,
  siteNode: SiteNodeCard as ComponentType<NodeProps>,
  siteGroupNode: SiteGroupNodeCard as ComponentType<NodeProps>,
  groupBand: GroupBandNode as ComponentType<NodeProps>,
  lePanel: LEPanelNode as ComponentType<NodeProps>,
  leHeader: LEHeaderNode as ComponentType<NodeProps>,
};

const edgeTypes = {
  treeEdge: TreeEdge,
} as EdgeTypes;

const GROUP_WIDTH = 256;
const GROUP_HEIGHT = 96;
const SORT_STEP = 1;

const handleNodeClick = () => undefined;

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const effectiveParent = (group: SiteGroup, groupById: Map<string, SiteGroup>): string | null =>
  group.parentId && groupById.has(group.parentId) ? group.parentId : null;

const nodeRect = (node: Node): Rect => ({
  x: node.position.x,
  y: node.position.y,
  width: node.measured?.width ?? GROUP_WIDTH,
  height: node.measured?.height ?? GROUP_HEIGHT,
});

const rectContains = (rect: Rect, x: number, y: number): boolean =>
  x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;

type DropDecision =
  | { kind: 'none' }
  | { kind: 'reparent'; targetId: string }
  | { kind: 'reparent-noop' }
  | { kind: 'reparent-cycle' };

export interface StructureGraphProps {
  orgId: string;
  structure: OrgStructureResponse;
  className?: string;
}

function StructureGraphInner({ orgId, structure, className }: StructureGraphProps) {
  const { fitView, getNode, getIntersectingNodes } = useReactFlow();
  const commit = useOptimisticStructure(orgId);
  const { manageLegalEntities } = useStructureActions();
  const hasLegalEntities = structure.legalEntities.length > 0;

  const layout = useMemo(() => buildStructureLayout(structure), [structure]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layout.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layout.edges);

  useEffect(() => {
    setNodes(layout.nodes);
    setEdges(layout.edges);
    setTimeout(() => fitView({ padding: 0.25, maxZoom: 0.85, duration: 300 }), 50);
  }, [layout, setNodes, setEdges, fitView]);

  const groupById = useMemo(() => new Map(structure.siteGroups.map((g) => [g.id, g])), [structure.siteGroups]);

  const isDescendant = useCallback(
    (candidateId: string, ancestorId: string): boolean => {
      const seen = new Set<string>();
      let current = groupById.get(candidateId);
      while (current?.parentId) {
        if (current.parentId === ancestorId) return true;
        if (seen.has(current.parentId)) break;
        seen.add(current.parentId);
        current = groupById.get(current.parentId);
      }
      return false;
    },
    [groupById],
  );

  const findContainingGroup = useCallback(
    (node: Node): Node | null => {
      const rect = nodeRect(node);
      const centerX = rect.x + rect.width / 2;
      const centerY = rect.y + rect.height / 2;
      const containing = getIntersectingNodes(node)
        .filter((n) => n.type === 'siteGroupNode' && n.id !== node.id && rectContains(nodeRect(n), centerX, centerY))
        .sort((a, b) => nodeRect(a).width * nodeRect(a).height - nodeRect(b).width * nodeRect(b).height);
      return containing[0] ?? null;
    },
    [getIntersectingNodes],
  );

  const resolveDrop = useCallback(
    (node: Node): DropDecision => {
      const dragged = groupById.get(node.id);
      if (!dragged) return { kind: 'none' };
      const target = findContainingGroup(node);
      if (!target) return { kind: 'none' };
      if (effectiveParent(dragged, groupById) === target.id) return { kind: 'reparent-noop' };
      if (isDescendant(target.id, node.id)) return { kind: 'reparent-cycle' };
      return { kind: 'reparent', targetId: target.id };
    },
    [groupById, findContainingGroup, isDescendant],
  );

  const applyHighlight = useCallback(
    (targetId: string | null) => {
      setNodes((current) =>
        current.map((n) => {
          if (n.type !== 'siteGroupNode') return n;
          const next = n.id === targetId;
          if (!!n.data.isDropTarget === next) return n;
          return { ...n, data: { ...n.data, isDropTarget: next } };
        }),
      );
    },
    [setNodes],
  );

  const revert = useCallback(() => setNodes(layout.nodes), [setNodes, layout.nodes]);

  const handleReparent = useCallback(
    (draggedId: string, targetId: string) => {
      const next = structure.siteGroups.map((g) => (g.id === draggedId ? { ...g, parentId: targetId } : g));
      commit(
        (s) => ({ ...s, siteGroups: next }),
        () => reparentSiteGroup({ orgId, groupId: draggedId, parentId: targetId }),
      );
    },
    [structure.siteGroups, commit, orgId],
  );

  const handleReorder = useCallback(
    (node: Node) => {
      const dragged = groupById.get(node.id);
      if (!dragged) return revert();
      const parent = effectiveParent(dragged, groupById);
      const siblings = structure.siteGroups.filter((g) => effectiveParent(g, groupById) === parent);
      if (siblings.length < 2) return revert();

      const xOf = (id: string): number => (id === node.id ? node.position.x : (getNode(id)?.position.x ?? 0));
      const ordered = [...siblings].sort((a, b) => xOf(a.id) - xOf(b.id));
      const originalSeq = [...siblings].sort(bySortOrder).map((g) => g.id);
      if (ordered.every((g, i) => g.id === originalSeq[i])) return revert();

      const ids = ordered.map((g) => g.id);
      const newOrder = new Map(ids.map((id, i) => [id, (i + 1) * SORT_STEP]));
      const next = structure.siteGroups.map((g) =>
        newOrder.has(g.id) ? { ...g, sortOrder: newOrder.get(g.id) as number } : g,
      );
      commit(
        (s) => ({ ...s, siteGroups: next }),
        () => reorderSiteGroups({ orgId, ids }),
      );
    },
    [groupById, structure.siteGroups, getNode, commit, revert, orgId],
  );

  const resolveSiteTarget = useCallback(
    (node: Node): string | null => findContainingGroup(node)?.id ?? null,
    [findContainingGroup],
  );

  const moveSiteToGroup = useCallback(
    (siteId: string, targetGroupId: string) => {
      commit(
        (s) => ({
          ...s,
          sites: s.sites.map((site) => (site.id === siteId ? { ...site, groupId: targetGroupId } : site)),
        }),
        () => updateOrgSite({ orgId, siteId, data: { groupId: targetGroupId } }),
        'Failed to move site to the group.',
      );
    },
    [commit, orgId],
  );

  const onNodeDrag = useCallback<OnNodeDrag>(
    (_event, node) => {
      if (node.type === 'siteNode') return applyHighlight(resolveSiteTarget(node));
      if (node.type !== 'siteGroupNode') return;
      const drop = resolveDrop(node);
      applyHighlight(drop.kind === 'reparent' ? drop.targetId : null);
    },
    [resolveDrop, resolveSiteTarget, applyHighlight],
  );

  const onNodeDragStop = useCallback<OnNodeDrag>(
    (_event, node) => {
      if (node.type === 'siteNode') {
        applyHighlight(null);
        const targetGroupId = resolveSiteTarget(node);
        const currentGroupId = (node.data as { groupId?: string | null }).groupId ?? null;
        if (!targetGroupId || targetGroupId === currentGroupId) return revert();
        return moveSiteToGroup(node.id, targetGroupId);
      }
      if (node.type !== 'siteGroupNode') return;
      applyHighlight(null);
      const drop = resolveDrop(node);
      if (drop.kind === 'reparent-cycle') {
        toast.error('Cannot move a group into one of its own sub-groups.');
        return revert();
      }
      if (drop.kind === 'reparent-noop') return revert();
      if (drop.kind === 'reparent') return handleReparent(node.id, drop.targetId);
      return handleReorder(node);
    },
    [resolveDrop, resolveSiteTarget, moveSiteToGroup, applyHighlight, revert, handleReparent, handleReorder],
  );

  return (
    <div className={`h-full w-full ${className ?? ''}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        nodeDragThreshold={4}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        fitViewOptions={{ padding: 0.25, maxZoom: 0.85 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Panel position="top-left">
          <StructureLegend />
        </Panel>
        {hasLegalEntities && (
          <Panel position="top-right">
            <Button
              variant="outline"
              size="icon"
              className="nodrag nopan bg-card shadow-sm"
              title="Manage legal entities"
              onClick={manageLegalEntities}
            >
              <Settings className="size-4" />
            </Button>
          </Panel>
        )}
        <Controls showInteractive={false} />
        <Background gap={16} size={1} />
      </ReactFlow>
    </div>
  );
}

export const StructureGraph = (props: StructureGraphProps) => (
  <ReactFlowProvider>
    <StructureGraphInner {...props} />
  </ReactFlowProvider>
);
