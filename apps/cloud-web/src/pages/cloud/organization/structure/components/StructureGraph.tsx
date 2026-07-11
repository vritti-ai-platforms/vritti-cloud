import {
  Background,
  ConnectionLineType,
  Controls,
  type EdgeTypes,
  type NodeProps,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import { type ComponentType, useEffect, useMemo } from 'react';
import type { OrgStructureResponse } from '@/schemas/cloud/org-structure';
import { GroupBandNode } from './GroupBandNode';
import { LEHeaderNode } from './LEHeaderNode';
import { LEPanelNode } from './LEPanelNode';
import { OrgNodeCard } from './OrgNodeCard';
import { SiteGroupNodeCard } from './SiteGroupNodeCard';
import { SiteNodeCard } from './SiteNodeCard';
import { StructureLegend } from './StructureLegend';
import { buildStructureLayout, type StructureLayoutCallbacks } from './structure-layout';
import { TreeEdge } from './TreeEdge';

import '@xyflow/react/dist/style.css';
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

// Present so React Flow keeps nodes interactive (pointer-events) for hover + in-card buttons; body click is intentionally a no-op
const handleNodeClick = () => undefined;

export interface StructureGraphProps extends StructureLayoutCallbacks {
  structure: OrgStructureResponse;
  className?: string;
}

function StructureGraphInner({
  structure,
  onAddRegistration,
  onOpenDetail,
  onAddChildGroup,
  onEditGroup,
  onDeleteGroup,
  className,
}: StructureGraphProps) {
  const { fitView } = useReactFlow();

  const layout = useMemo(
    () =>
      buildStructureLayout(structure, {
        onAddRegistration,
        onOpenDetail,
        onAddChildGroup,
        onEditGroup,
        onDeleteGroup,
      }),
    [structure, onAddRegistration, onOpenDetail, onAddChildGroup, onEditGroup, onDeleteGroup],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layout.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layout.edges);

  useEffect(() => {
    setNodes(layout.nodes);
    setEdges(layout.edges);
    setTimeout(() => fitView({ padding: 0.25, maxZoom: 0.85, duration: 300 }), 50);
  }, [layout, setNodes, setEdges, fitView]);

  return (
    <div className={`h-150 w-full rounded-lg border bg-background ${className ?? ''}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
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
