import { cn } from '@vritti/quantum-ui/cn';
import { Ban } from 'lucide-react';
import { GROUP_COLORS } from '@/pages/cloud/organization/structure/graph/group-colors';

interface GroupColorFieldProps {
  // name is consumed by the quantum <Form> to wire this field via Controller, then stripped
  name?: string;
  value?: string | null;
  onChange?: (value: string | null) => void;
  label?: string;
  error?: string;
  className?: string;
}

// Compact swatch selector for a site group's color. null clears back to the default primary.
export const GroupColorField = ({ value, onChange, label = 'Color', error, className }: GroupColorFieldProps) => (
  <div className={cn('flex flex-col gap-1.5', className)}>
    {label && <span className="text-sm font-medium leading-none">{label}</span>}
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        title="Default (no color)"
        aria-label="Default (no color)"
        onClick={() => onChange?.(null)}
        className={cn(
          'flex size-6 items-center justify-center rounded-full border border-border text-muted-foreground transition-transform hover:scale-110',
          !value && 'ring-2 ring-ring ring-offset-2 ring-offset-background',
        )}
      >
        <Ban className="size-3.5" />
      </button>
      {GROUP_COLORS.map((color) => (
        <button
          key={color.key}
          type="button"
          title={color.label}
          aria-label={color.label}
          onClick={() => onChange?.(color.key)}
          style={{ backgroundColor: color.var }}
          className={cn(
            'size-6 rounded-full transition-transform hover:scale-110',
            value === color.key && 'ring-2 ring-ring ring-offset-2 ring-offset-background',
          )}
        />
      ))}
    </div>
    {error && <span className="text-sm text-destructive">{error}</span>}
  </div>
);
