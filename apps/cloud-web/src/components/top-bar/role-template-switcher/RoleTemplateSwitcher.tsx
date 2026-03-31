import { Button } from '@vritti/quantum-ui/Button';
import { Select } from '@vritti/quantum-ui/Select';
import { Separator } from '@vritti/quantum-ui/Separator';
import { buildSlug, parseSlug } from '@vritti/quantum-ui/utils/slug';
import { Check, ChevronsUpDown, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RoleTemplateSwitcherProps {
  versionSlug: string;
  currentRoleId: string;
  currentRoleName?: string;
}

export const RoleTemplateSwitcher = ({ versionSlug, currentRoleId, currentRoleName }: RoleTemplateSwitcherProps) => {
  const navigate = useNavigate();
  const versionId = parseSlug(versionSlug)?.id ?? '';

  return (
    <Select
      optionsEndpoint="select-api/role-templates"
      params={{ versionId }}
      fieldKeys={{ valueKey: 'id', labelKey: 'name' }}
      value={currentRoleId}
      searchable
      searchPlaceholder="Find role template..."
      contentClassName="w-60"
      anchor={({ selectedOption }) => (
        <Button
          startAdornment={<Shield className="size-4 text-muted-foreground" />}
          variant="ghost"
          className="h-auto min-w-25 p-0 gap-1.5 text-sm font-normal hover:bg-transparent"
        >
          <span className="flex-1 text-left font-normal text-foreground">
            {selectedOption?.label ?? currentRoleName ?? 'Role Template'}
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
              onClick={() => navigate(`/versions/${versionSlug}/role-templates`)}
            >
              All Role Templates
            </Button>
          </div>
        </>
      }
      onOptionSelect={(option) => {
        if (option) {
          navigate(`/versions/${versionSlug}/role-templates/rt-${buildSlug(String(option.label), String(option.value))}`);
        }
      }}
    />
  );
};
