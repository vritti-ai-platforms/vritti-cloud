import type { ReactNode } from 'react';

const Item = ({ swatch, children }: { swatch: ReactNode; children: ReactNode }) => (
  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
    {swatch}
    {children}
  </span>
);

const Pip = ({ className }: { className: string }) => <span className={`h-3 w-0.75 rounded-sm ${className}`} />;

// Legend for the structure graph
export const StructureLegend = () => (
  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-border bg-card/90 px-3 py-2 shadow-sm backdrop-blur-sm">
    <Item swatch={<span className="size-3 rounded-sm bg-primary" />}>Organization</Item>
    <Item swatch={<span className="size-3 rounded-sm border border-dashed border-primary/40 bg-primary/10" />}>
      Site group
    </Item>
    <Item swatch={<span className="h-0 w-4 border-t-2 border-primary" />}>Group hierarchy</Item>
    <Item swatch={<span className="h-0 w-4 border-t-2 border-dotted border-primary" />}>Group membership</Item>
    <Item swatch={<span className="size-3 rounded-sm border border-border bg-muted/60" />}>Legal entity</Item>
    <Item swatch={<span className="size-3 rounded-sm border border-info/40 bg-muted/50" />}>Subsidiary</Item>
    <span className="h-3.5 w-px bg-border" />
    <Item swatch={<Pip className="bg-success" />}>Outlet</Item>
    <Item swatch={<Pip className="bg-info" />}>Warehouse</Item>
    <Item swatch={<Pip className="bg-primary" />}>Production</Item>
  </div>
);
