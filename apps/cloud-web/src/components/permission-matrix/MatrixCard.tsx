import { Collapsible } from '@vritti/quantum-ui/Collapsible';
import { DynamicIcon, type IconName } from 'lucide-react/dynamic';
import type React from 'react';
import type { MatrixColumn } from './MatrixRow';

interface MatrixCardProps {
  icon: string | null;
  name: string;
  // Right-of-title summary (e.g. "3/8 features added" or "5 unlocked") — caller decides the wording
  countLabel: string;
  columns: MatrixColumn[];
  expanded: boolean;
  onToggleExpanded: () => void;
  children: React.ReactNode;
}

// Presentational app-card shell: collapsible header (icon + name + count) and the platform column header.
// No domain types — used by both the plan (unlocks) and role-template (grants) matrices.
export const MatrixCard: React.FC<MatrixCardProps> = ({
  icon,
  name,
  countLabel,
  columns,
  expanded,
  onToggleExpanded,
  children,
}) => (
  <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
    <Collapsible
      open={expanded}
      onOpenChange={onToggleExpanded}
      headerClassName="bg-muted/50 px-4 py-3 transition-colors hover:bg-muted"
      triggerClassName="gap-2.5"
      trigger={
        <>
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <DynamicIcon name={(icon ?? 'layers') as IconName} className="size-4" />
          </div>
          <div className="flex min-w-0 flex-col items-start gap-0.5 leading-none">
            <span className="text-sm font-semibold text-foreground">{name}</span>
            <span className="text-xs font-light font-mono text-foreground">{countLabel}</span>
          </div>
        </>
      }
    >
      {/* Column header — Feature + the platform labels, aligned with MatrixRow's cells */}
      <div className="flex items-center gap-3 border-y bg-background px-4 py-2">
        <span className="flex-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Feature</span>
        <div className="flex">
          {columns.map((col) => (
            <span
              key={col.key}
              className="w-24 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              {col.label}
            </span>
          ))}
        </div>
      </div>

      <div className="divide-y bg-background">{children}</div>
    </Collapsible>
  </div>
);
