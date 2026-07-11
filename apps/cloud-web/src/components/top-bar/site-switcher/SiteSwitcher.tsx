import { useOrgSites } from '@hooks/cloud/org-sites';
import { Button } from '@vritti/quantum-ui/Button';
import { Select } from '@vritti/quantum-ui/Select';
import { Separator } from '@vritti/quantum-ui/Separator';
import { buildSlug } from '@vritti/quantum-ui/slug';
import { Building2, Check, ChevronsUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SITE_TYPE_LABELS } from '@/schemas/cloud/org-sites';

interface SiteSwitcherProps {
  orgId: string;
  orgSlug: string;
  currentSiteId: string;
  currentSiteName?: string;
}

// Renders the site switcher dropdown in the breadcrumb
export const SiteSwitcher = ({ orgId, orgSlug, currentSiteId, currentSiteName }: SiteSwitcherProps) => {
  const navigate = useNavigate();
  const { data: response } = useOrgSites(orgId);
  const sites = response?.result ?? [];

  const options = sites.map((site) => ({
    value: site.id,
    label: site.name,
    description: SITE_TYPE_LABELS[site.type] ?? site.type,
  }));

  return (
    <Select
      options={options}
      value={currentSiteId}
      searchable
      searchPlaceholder="Find site..."
      contentClassName="w-64"
      anchor={({ selectedOption }) => (
        <Button
          startAdornment={<Building2 className="size-4 text-muted-foreground" />}
          variant="ghost"
          className="h-auto min-w-25 p-0 gap-1.5 text-sm font-normal hover:bg-transparent"
        >
          <span className="flex-1 text-left font-normal text-foreground">
            {selectedOption?.label ?? currentSiteName ?? 'Site'}
          </span>
          <span className="flex items-center justify-center size-6 rounded-full border border-border hover:bg-accent transition-colors">
            <ChevronsUpDown className="size-3.5 text-muted-foreground" />
          </span>
        </Button>
      )}
      renderOption={({ option, selected, onSelect }) => (
        <Button
          variant="ghost"
          className="w-full justify-start h-auto gap-2 px-3 py-1.5 text-sm font-normal"
          onClick={onSelect}
        >
          <span className="flex-1 text-left truncate">{option.label}</span>
          {option.description && (
            <span className="shrink-0 rounded-full border border-border px-1.5 py-px text-xs font-medium font-mono tracking-wider">
              {option.description}
            </span>
          )}
          {selected && <Check className="size-4 shrink-0" />}
        </Button>
      )}
      footer={
        <>
          <Separator />
          <div className="p-1">
            <Button
              variant="ghost"
              className="w-full justify-start h-auto px-2 py-1.5 text-sm font-normal"
              onClick={() => navigate(`/${orgSlug}/structure`)}
            >
              All Sites
            </Button>
          </div>
        </>
      }
      onOptionSelect={(option) => {
        if (option) {
          navigate(`/${orgSlug}/structure/site-${buildSlug(String(option.label), String(option.value))}`);
        }
      }}
    />
  );
};
