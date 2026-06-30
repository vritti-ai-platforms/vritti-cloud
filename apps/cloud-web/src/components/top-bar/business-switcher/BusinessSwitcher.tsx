import { Button } from '@vritti/quantum-ui/Button';
import { Select } from '@vritti/quantum-ui/Select';
import { Separator } from '@vritti/quantum-ui/Separator';
import { buildSlug, parseSlug } from '@vritti/quantum-ui/slug';
import { Briefcase, Check, ChevronsUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BusinessSwitcherProps {
  versionSlug: string;
  currentBusinessId: string;
  currentBusinessName?: string;
}

// Renders the business switcher dropdown in the top bar breadcrumb
export const BusinessSwitcher = ({ versionSlug, currentBusinessId, currentBusinessName }: BusinessSwitcherProps) => {
  const navigate = useNavigate();
  const versionId = parseSlug(versionSlug)?.id ?? '';

  return (
    <Select
      optionsEndpoint="select-api/businesses"
      params={{ inVersion: versionId }}
      fieldKeys={{ valueKey: 'id', labelKey: 'name', descriptionKey: 'code' }}
      value={currentBusinessId}
      searchable
      searchPlaceholder="Find business..."
      contentClassName="w-60"
      anchor={({ selectedOption }) => (
        <Button
          startAdornment={<Briefcase className="size-4 text-muted-foreground" />}
          variant="ghost"
          className="h-auto min-w-25 p-0 gap-1.5 text-sm font-normal hover:bg-transparent"
        >
          <span className="flex-1 text-left font-normal text-foreground">
            {selectedOption?.label ?? currentBusinessName ?? 'Business'}
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
              onClick={() => navigate(`/versions/${versionSlug}/businesses`)}
            >
              All Businesses
            </Button>
          </div>
        </>
      }
      onOptionSelect={(option) => {
        // Skip the on-mount initial-resolve fire (same business) — only navigate on a real switch
        if (option && String(option.value) !== currentBusinessId) {
          navigate(`/versions/${versionSlug}/businesses/biz-${buildSlug(String(option.label), String(option.value))}`);
        }
      }}
    />
  );
};
