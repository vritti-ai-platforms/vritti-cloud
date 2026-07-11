import { Checkbox } from '@vritti/quantum-ui/Checkbox';
import type React from 'react';
import { SITE_TYPE_LABELS, SITE_TYPE_VALUES, type SiteType } from '@/schemas/admin/features';

interface SiteTypeChecklistProps {
  name?: string;
  label?: string;
  description?: string;
  error?: string;
  value?: SiteType[];
  onChange?: (next: SiteType[]) => void;
}

export const SiteTypeChecklist: React.FC<SiteTypeChecklistProps> = ({
  label = 'Site Types',
  description,
  error,
  value = [],
  onChange,
}) => {
  const toggle = (type: SiteType) => {
    const next = value.includes(type)
      ? SITE_TYPE_VALUES.filter((t) => value.includes(t) && t !== type)
      : SITE_TYPE_VALUES.filter((t) => value.includes(t) || t === type);
    onChange?.(next);
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="flex items-center gap-6">
        {SITE_TYPE_VALUES.map((type) => (
          <Checkbox
            key={type}
            label={SITE_TYPE_LABELS[type]}
            checked={value.includes(type)}
            onCheckedChange={() => toggle(type)}
          />
        ))}
      </div>
      {description && !error && <span className="text-xs text-muted-foreground">{description}</span>}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
};
