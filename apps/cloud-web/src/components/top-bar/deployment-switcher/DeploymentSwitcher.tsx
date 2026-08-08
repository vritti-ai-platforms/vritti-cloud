import { Button } from '@vritti/quantum-ui/Button';
import { Select } from '@vritti/quantum-ui/Select';
import { Separator } from '@vritti/quantum-ui/Separator';
import { buildSlug } from '@vritti/quantum-ui/slug';
import { Check, ChevronsUpDown, Server } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface DeploymentSwitcherProps {
  currentDeploymentId: string;
  currentDeploymentName?: string;
}

// Renders the deployment switcher dropdown in the top bar breadcrumb
export const DeploymentSwitcher = ({ currentDeploymentId, currentDeploymentName }: DeploymentSwitcherProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <Select
      optionsEndpoint="select-api/deployments"
      fieldKeys={{ valueKey: 'id', labelKey: 'name' }}
      value={currentDeploymentId}
      searchable
      searchPlaceholder="Find deployment..."
      contentClassName="w-60"
      anchor={({ selectedOption }) => (
        <Button
          startAdornment={<Server className="size-4 text-muted-foreground" />}
          variant="ghost"
          className="h-auto min-w-25 p-0 gap-1.5 text-sm font-normal hover:bg-transparent"
        >
          <span className="flex-1 text-left font-normal text-foreground">
            {selectedOption?.label ?? currentDeploymentName ?? 'Deployment'}
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
              onClick={() => navigate('/deployments')}
            >
              All Deployments
            </Button>
          </div>
        </>
      }
      onOptionSelect={(option) => {
        // Skip the on-mount initial-resolve fire (same deployment) — only navigate on a real switch
        if (option && String(option.value) !== currentDeploymentId) {
          const newSlug = `dep-${buildSlug(String(option.label), String(option.value))}`;
          // Preserve the active tab segment (/deployments/:deploymentSlug/:deploymentTab)
          const tab = pathname.split('/')[3] ?? 'overview';
          navigate(`/deployments/${newSlug}/${tab}`);
        }
      }}
    />
  );
};
