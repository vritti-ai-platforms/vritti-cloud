import type { StepDef } from '@vritti/quantum-ui/StepProgressIndicator';
import { Blocks, Boxes, Database, FileSignature, KeyRound, Link2, RefreshCw, ServerCog, Settings2 } from 'lucide-react';
import type { ReactNode } from 'react';
import type { AgentStatus, Deployment } from '@/schemas/admin/deployments';

export type AgentStepId =
  | 'general'
  | 'database'
  | 'addons'
  | 'secret-store'
  | 'signing-key'
  | 'enroll'
  | 'connect'
  | 'provision'
  | 'sync';
export type ManualStepId = 'general' | 'signing-key' | 'sync';

interface WizardStep<Id extends string> {
  id: Id;
  label: string;
  icon: ReactNode;
}

// The full agent journey — config steps 1..4 are gathered in form state and persisted in a single
// create call at the config→lifecycle boundary; steps 5..8 run against the created deployment.
export const AGENT_WIZARD_STEPS: WizardStep<AgentStepId>[] = [
  { id: 'general', label: 'General', icon: <Settings2 className="h-4 w-4" /> },
  { id: 'database', label: 'Database', icon: <Database className="h-4 w-4" /> },
  { id: 'addons', label: 'Add-ons', icon: <Blocks className="h-4 w-4" /> },
  { id: 'secret-store', label: 'Secret Store', icon: <KeyRound className="h-4 w-4" /> },
  { id: 'signing-key', label: 'Signing Key', icon: <FileSignature className="h-4 w-4" /> },
  { id: 'enroll', label: 'Enroll', icon: <ServerCog className="h-4 w-4" /> },
  { id: 'connect', label: 'Connect', icon: <Link2 className="h-4 w-4" /> },
  { id: 'provision', label: 'Provision', icon: <Boxes className="h-4 w-4" /> },
  { id: 'sync', label: 'Sync', icon: <RefreshCw className="h-4 w-4" /> },
];

export const MANUAL_WIZARD_STEPS: WizardStep<ManualStepId>[] = [
  { id: 'general', label: 'General', icon: <Settings2 className="h-4 w-4" /> },
  { id: 'signing-key', label: 'Signing Key', icon: <KeyRound className="h-4 w-4" /> },
  { id: 'sync', label: 'Sync', icon: <RefreshCw className="h-4 w-4" /> },
];

export function toStepDefs<Id extends string>(steps: WizardStep<Id>[]): StepDef[] {
  return steps.map((step) => ({ label: step.label, icon: step.icon }));
}

// 1-based index of a step id within its journey (for StepProgressIndicator.currentStep).
export function stepNumber<Id extends string>(steps: WizardStep<Id>[], id: Id): number {
  return steps.findIndex((step) => step.id === id) + 1;
}

// The agent has finished reconciling the desired state and is running the requested generation.
export function isReconcileReady(agent: AgentStatus): boolean {
  return (
    agent.lastPhase === 'ready' && agent.lastGeneration != null && agent.lastGeneration === agent.desiredGeneration
  );
}

// The agent reported a phase that is not progressing toward ready.
export function isFailingPhase(agent: AgentStatus): boolean {
  return /error|fail/i.test(agent.lastPhase ?? '');
}

// Resume: for an agent deployment whose config is already persisted, re-enter the lifecycle half at
// the first incomplete step.
export function deriveAgentLifecycleStep(
  deployment: Deployment,
  agent: AgentStatus,
): Extract<AgentStepId, 'signing-key' | 'enroll' | 'connect' | 'provision' | 'sync'> {
  // The license signing key (LICENSE_PUBLIC_KEY) must exist before the agent provisions core-server,
  // so it gates the lifecycle: no enrolling until the key is generated.
  if (!deployment.hasSigningKey) return 'signing-key';
  if (!agent.enrolled) return agent.status === 'pending' ? 'connect' : 'enroll';
  if (!isReconcileReady(agent)) return 'provision';
  return 'sync';
}

export function deriveManualLifecycleStep(deployment: Deployment): Extract<ManualStepId, 'signing-key' | 'sync'> {
  if (!deployment.hasSigningKey) return 'signing-key';
  return 'sync';
}
