import { cn } from '@vritti/quantum-ui/cn';
import { useDroppable } from '@vritti/quantum-ui/dnd-kit/core';
import { ArrowUpToLine } from 'lucide-react';

interface RootDropZoneProps {
  id: string;
  active: boolean;
}

// Top-level drop target to detach a row to root
export const RootDropZone = ({ id, active }: RootDropZoneProps) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex items-center justify-center gap-1.5 rounded-md border border-dashed py-2 text-xs transition-colors',
        active ? 'border-primary bg-primary/10 font-medium text-primary' : 'border-border text-muted-foreground',
      )}
    >
      <ArrowUpToLine className="size-3.5" aria-hidden />
      Drop here to make top-level
    </div>
  );
};
