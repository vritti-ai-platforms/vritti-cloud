import { Button } from '@vritti/quantum-ui/Button';
import { Select } from '@vritti/quantum-ui/Select';
import { Separator } from '@vritti/quantum-ui/Separator';
import { buildSlug, parseSlug } from '@vritti/quantum-ui/slug';
import { Blocks, Check, ChevronsUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FeatureSwitcherProps {
  versionSlug: string;
  currentFeatureId: string;
  currentFeatureName?: string;
}

export const FeatureSwitcher = ({ versionSlug, currentFeatureId, currentFeatureName }: FeatureSwitcherProps) => {
  const navigate = useNavigate();
  const versionId = parseSlug(versionSlug)?.id ?? '';

  return (
    <Select
      optionsEndpoint="select-api/features"
      params={{ versionId }}
      fieldKeys={{ valueKey: 'id', labelKey: 'name', descriptionKey: 'code' }}
      value={currentFeatureId}
      searchable
      searchPlaceholder="Find feature..."
      contentClassName="w-60"
      anchor={({ selectedOption }) => (
        <Button
          startAdornment={<Blocks className="size-4 text-muted-foreground" />}
          variant="ghost"
          className="h-auto min-w-25 p-0 gap-1.5 text-sm font-normal hover:bg-transparent"
        >
          <span className="flex-1 text-left font-normal text-foreground">
            {selectedOption?.label ?? currentFeatureName ?? 'Feature'}
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
              onClick={() => navigate(`/versions/${versionSlug}/features`)}
            >
              All Features
            </Button>
          </div>
        </>
      }
      onOptionSelect={(option) => {
        if (option) {
          navigate(`/versions/${versionSlug}/features/feat-${buildSlug(String(option.label), String(option.value))}`);
        }
      }}
    />
  );
};
