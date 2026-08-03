import type { StepDef } from '@vritti/quantum-ui/StepProgressIndicator';
import { Database, Lock, Settings2 } from 'lucide-react';
import type { ReactNode } from 'react';

// The managed create journey — ends at "deployment created". Everything operational (enroll → secret
// store → DNS → sync) moves to the in-view setup flow.
export type ManagedWizardStep = 'general' | 'database' | 'edge';

interface WizardStep {
  id: ManagedWizardStep;
  label: string;
  icon: ReactNode;
}

export const MANAGED_WIZARD_STEPS: WizardStep[] = [
  { id: 'general', label: 'General', icon: <Settings2 className="h-4 w-4" /> },
  { id: 'database', label: 'Database', icon: <Database className="h-4 w-4" /> },
  { id: 'edge', label: 'Edge & TLS', icon: <Lock className="h-4 w-4" /> },
];

export function toStepDefs(steps: WizardStep[]): StepDef[] {
  return steps.map((step) => ({ label: step.label, icon: step.icon }));
}
