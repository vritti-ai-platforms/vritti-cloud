import type { StepDef } from '@vritti/quantum-ui/StepProgressIndicator';
import { Boxes, FileSignature, Globe, KeyRound, Link2, RefreshCw, ServerCog } from 'lucide-react';
import type { AgentStatus, Condition, Deployment } from '@/schemas/admin/deployments';

export type ManagedSetupStep = 'signing-key' | 'enroll' | 'secret-store' | 'connect' | 'dns' | 'provision' | 'sync';
export type LocalSetupStep = 'signing-key' | 'sync';

interface SetupStep<Id extends string> {
  id: Id;
  label: string;
  icon: StepDef['icon'];
}

export const MANAGED_SETUP_STEPS: SetupStep<ManagedSetupStep>[] = [
  { id: 'signing-key', label: 'Signing Key', icon: <FileSignature className="h-4 w-4" /> },
  { id: 'enroll', label: 'Enroll', icon: <ServerCog className="h-4 w-4" /> },
  { id: 'secret-store', label: 'Secret Store', icon: <KeyRound className="h-4 w-4" /> },
  { id: 'connect', label: 'Connect', icon: <Link2 className="h-4 w-4" /> },
  { id: 'dns', label: 'DNS', icon: <Globe className="h-4 w-4" /> },
  { id: 'provision', label: 'Provision', icon: <Boxes className="h-4 w-4" /> },
  { id: 'sync', label: 'Sync', icon: <RefreshCw className="h-4 w-4" /> },
];

export const LOCAL_SETUP_STEPS: SetupStep<LocalSetupStep>[] = [
  { id: 'signing-key', label: 'Signing Key', icon: <FileSignature className="h-4 w-4" /> },
  { id: 'sync', label: 'Sync', icon: <RefreshCw className="h-4 w-4" /> },
];

export function toStepDefs<Id extends string>(steps: SetupStep<Id>[]): StepDef[] {
  return steps.map((step) => ({ label: step.label, icon: step.icon }));
}

// 1-based index of a step id within its journey (for StepProgressIndicator.currentStep).
export function stepNumber<Id extends string>(steps: SetupStep<Id>[], id: Id): number {
  return steps.findIndex((step) => step.id === id) + 1;
}

// The first active condition of a given type ('true' status), if any.
export function activeCondition(agent: AgentStatus, type: Condition['type']): Condition | undefined {
  return agent.conditions.find((condition) => condition.type === type && condition.status === 'true');
}

// The agent has finished reconciling and reports the desired state as Ready.
export function isReady(agent: AgentStatus): boolean {
  return !!activeCondition(agent, 'Ready');
}

// The reconcile is failing — a Degraded condition or a Blocked/Reconciling condition whose reason is an
// error (ReconcileError). DNS delegation is a benign block and is handled separately.
export function reconcileError(agent: AgentStatus): Condition | undefined {
  return agent.conditions.find(
    (condition) =>
      condition.status === 'true' &&
      (condition.type === 'Degraded' || /error/i.test(condition.reason)) &&
      condition.reason !== 'AwaitingDnsDelegation',
  );
}

// The managed edge issues its own wildcard cert via ACME DNS-01, so it needs the operator's one-time
// DNS delegation. An external edge (BYO ingress/LB) never blocks on DNS.
export function edgeIsManaged(deployment: Deployment): boolean {
  return deployment.spec.components.edge?.mode === 'managed';
}

// The wildcard cert is in place once the agent reports at least one certificate — the STABLE signal to
// gate on (delegation is null both before ACME starts and after the cert issues).
export function certIssued(agent: AgentStatus): boolean {
  return (agent.certificates?.length ?? 0) > 0;
}

// A managed edge is still blocked on DNS until its wildcard cert has issued.
export function needsDns(deployment: Deployment, agent: AgentStatus): boolean {
  return edgeIsManaged(deployment) && !certIssued(agent);
}

// The Blocked condition surfacing the pending DNS delegation, if the edge is awaiting it.
export function dnsBlockedCondition(agent: AgentStatus): Condition | undefined {
  return agent.conditions.find(
    (condition) => condition.type === 'Blocked' && condition.status === 'true' && condition.component === 'edge',
  );
}

// The agent needs a secret store to source runtime secrets before it can provision the stack.
export function secretStoreConfigured(deployment: Deployment): boolean {
  return !!deployment.spec.components.secretStore;
}

// Setup is complete once the agent is enrolled, its secret store is configured, and the signed catalog
// has been pushed to core.
export function managedSetupComplete(deployment: Deployment, agent: AgentStatus): boolean {
  return agent.enrolled && secretStoreConfigured(deployment) && deployment.catalogSynced;
}

export function localSetupComplete(deployment: Deployment): boolean {
  return deployment.hasSigningKey && deployment.catalogSynced;
}

// Resume: re-enter the managed lifecycle at the first incomplete step, derived from conditions +
// enrollment + the wildcard cert (never from an ad-hoc phase string).
export function deriveManagedStep(deployment: Deployment, agent: AgentStatus): ManagedSetupStep {
  if (!deployment.hasSigningKey) return 'signing-key';
  // No enroll token issued yet (no agent row) — start enrollment.
  if (agent.status == null) return 'enroll';
  // Enroll token issued: configure the secret store before the agent connects/provisions.
  if (!secretStoreConfigured(deployment)) return 'secret-store';
  // Token issued but the agent hasn't connected yet — wait on Connect.
  if (!agent.enrolled) return 'connect';
  if (needsDns(deployment, agent)) return 'dns';
  if (!isReady(agent)) return 'provision';
  return 'sync';
}

export function deriveLocalStep(deployment: Deployment): LocalSetupStep {
  if (!deployment.hasSigningKey) return 'signing-key';
  return 'sync';
}
