import { Button } from '@vritti/quantum-ui/Button';
import { Typography } from '@vritti/quantum-ui/Typography';
import { ArrowRight, Check, Cloud, HardDrive } from 'lucide-react';
import type React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useWatch } from 'react-hook-form';
import type { CreateDeploymentData } from '@/schemas/admin/deployments';

interface ModeStepProps {
  form: UseFormReturn<CreateDeploymentData>;
  onContinue: () => void;
}

const MODES = [
  {
    value: 'manual' as const,
    icon: HardDrive,
    title: 'Local',
    description: 'Self-hosted deployment you manage manually. A signing key is issued once at creation.',
  },
  {
    value: 'agent' as const,
    icon: Cloud,
    title: 'Managed',
    description: 'Provisioned and operated by an agent on a cloud region and provider.',
  },
];

export const ModeStep: React.FC<ModeStepProps> = ({ form, onContinue }) => {
  const managementMode = useWatch({ control: form.control, name: 'managementMode' });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {MODES.map((mode) => {
          const Icon = mode.icon;
          const isSelected = managementMode === mode.value;
          return (
            // biome-ignore lint/a11y/useSemanticElements: large clickable mode card region, not a native button
            <div
              key={mode.value}
              role="button"
              tabIndex={0}
              onClick={() => form.setValue('managementMode', mode.value, { shouldValidate: true })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  form.setValue('managementMode', mode.value, { shouldValidate: true });
                }
              }}
              className={`group relative cursor-pointer rounded-xl border bg-card p-6 transition-all hover:border-primary/50 hover:bg-card/80 ${
                isSelected ? 'ring-2 ring-primary border-primary' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                  <Icon className="h-5 w-5 text-primary-foreground" />
                </div>
                {isSelected && (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </div>
              <Typography variant="h4">{mode.title}</Typography>
              <Typography variant="body2" intent="muted" className="mt-2">
                {mode.description}
              </Typography>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-2">
        <Button type="button" disabled={!managementMode} onClick={onContinue}>
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
