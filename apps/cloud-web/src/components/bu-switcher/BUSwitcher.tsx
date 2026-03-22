import { useOrgBusinessUnits } from '@hooks/cloud/org-business-units';
import { Button } from '@vritti/quantum-ui/Button';
import { Select } from '@vritti/quantum-ui/Select';
import { Separator } from '@vritti/quantum-ui/Separator';
import { buildSlug } from '@vritti/quantum-ui/utils/slug';
import { Building2, Check, ChevronsUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BUSwitcherProps {
  orgId: string;
  orgSlug: string;
  currentBuId: string;
  currentBuName?: string;
}

// Renders the BU switcher dropdown in the breadcrumb
export const BUSwitcher = ({ orgId, orgSlug, currentBuId, currentBuName }: BUSwitcherProps) => {
  const navigate = useNavigate();
  const { data: response } = useOrgBusinessUnits(orgId);
  const units = response?.result ?? [];

  const options = units.map((bu) => ({
    value: bu.id,
    label: bu.name,
    description: bu.type.charAt(0) + bu.type.slice(1).toLowerCase(),
  }));

  return (
    <Select
      options={options}
      value={currentBuId}
      searchable
      searchPlaceholder="Find business unit..."
      contentClassName="w-64"
      anchor={({ selectedOption }) => (
        <Button
          startAdornment={<Building2 className="size-4 text-muted-foreground" />}
          variant="ghost"
          className="h-auto min-w-25 p-0 gap-1.5 text-sm font-normal hover:bg-transparent"
        >
          <span className="flex-1 text-left font-normal text-foreground">
            {selectedOption?.label ?? currentBuName ?? 'Business Unit'}
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
            <span className="shrink-0 rounded-full border border-border px-1.5 py-px text-[10px] font-medium font-mono tracking-wider">
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
              onClick={() => navigate(`/${orgSlug}/business-units`)}
            >
              All Business Units
            </Button>
          </div>
        </>
      }
      onOptionSelect={(option) => {
        if (option) {
          navigate(`/${orgSlug}/business-units/bu-${buildSlug(String(option.label), String(option.value))}`);
        }
      }}
    />
  );
};
