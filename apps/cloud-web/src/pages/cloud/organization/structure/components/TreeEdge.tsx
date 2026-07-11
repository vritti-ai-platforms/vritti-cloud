import { BaseEdge, type EdgeProps, getSmoothStepPath, Position } from '@xyflow/react';

const CONVERGE_OFFSET = 36;

// Tree connector that branches just below the parent instead of at the midpoint of the drop
export const TreeEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
}: EdgeProps) => {
  const [path] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition: sourcePosition ?? Position.Bottom,
    targetPosition: targetPosition ?? Position.Top,
    borderRadius: 8,
    centerY: sourceY + CONVERGE_OFFSET,
  });
  return <BaseEdge id={id} path={path} style={style} markerEnd={markerEnd} />;
};
