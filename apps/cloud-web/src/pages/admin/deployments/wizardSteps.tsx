import type { StepDef } from '@vritti/quantum-ui/StepProgressIndicator';
import {
  Blocks,
  Boxes,
  Database,
  FileSignature,
  Globe,
  KeyRound,
  Link2,
  RefreshCw,
  ServerCog,
  Settings2,
} from 'lucide-react';
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
  | 'dns-delegation'
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
  { id: 'dns-delegation', label: 'DNS', icon: <Globe className="h-4 w-4" /> },
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

// A managed edge terminates TLS itself, so it needs the operator's one-time DNS CNAME before it can
// issue its wildcard cert. An external edge (BYO ingress/LB) needs no DNS-delegation step at all.
export function needsDnsDelegation(deployment: Deployment): boolean {
  return deployment.edge === 'managed';
}

// The wildcard cert is in place once the agent reports at least one certificate. This is the STABLE
// signal to gate on — not agent.acmeDelegation, which is null both BEFORE the agent reaches ACME and
// AFTER the cert issues, and only briefly present while awaiting the CNAME. Gating on the delegation
// lets the DNS step be skipped (null at connect time) or falsely show "issued" (null before ACME).
export function certIssued(agent: AgentStatus): boolean {
  return (agent.certificates?.length ?? 0) > 0;
}

// The step to enter once the agent is connected: managed edges must clear DNS delegation (wildcard
// cert issued) before provisioning; everything else goes straight to provision.
export function stepAfterConnect(
  deployment: Deployment,
  agent: AgentStatus,
): Extract<AgentStepId, 'dns-delegation' | 'provision'> {
  return needsDnsDelegation(deployment) && !certIssued(agent) ? 'dns-delegation' : 'provision';
}

// Resume: for an agent deployment whose config is already persisted, re-enter the lifecycle half at
// the first incomplete step.
export function deriveAgentLifecycleStep(
  deployment: Deployment,
  agent: AgentStatus,
): Extract<AgentStepId, 'signing-key' | 'enroll' | 'connect' | 'dns-delegation' | 'provision' | 'sync'> {
  // The license signing key (LICENSE_PUBLIC_KEY) must exist before the agent provisions core-server,
  // so it gates the lifecycle: no enrolling until the key is generated.
  if (!deployment.hasSigningKey) return 'signing-key';
  if (!agent.enrolled) return agent.status === 'pending' ? 'connect' : 'enroll';
  // A managed edge must have its wildcard cert issued before the stack step is meaningful, so hold at
  // DNS delegation until a certificate exists — this can't be skipped and never advances early.
  if (needsDnsDelegation(deployment) && !certIssued(agent)) return 'dns-delegation';
  if (!isReconcileReady(agent)) return 'provision';
  return 'sync';
}

export function deriveManualLifecycleStep(deployment: Deployment): Extract<ManualStepId, 'signing-key' | 'sync'> {
  if (!deployment.hasSigningKey) return 'signing-key';
  return 'sync';
}
