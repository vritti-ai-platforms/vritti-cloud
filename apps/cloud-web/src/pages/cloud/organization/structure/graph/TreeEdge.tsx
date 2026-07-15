import { BaseEdge, type EdgeProps, getSmoothStepPath, Position } from '@vritti/quantum-ui/react-flow';

const CONVERGE_OFFSET = 36;

// Tree connector edge
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
