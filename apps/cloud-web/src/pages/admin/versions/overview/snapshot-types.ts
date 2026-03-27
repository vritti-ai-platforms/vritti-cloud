export interface SnapshotFeature {
  code: string;
  name: string;
  icon: string | null;
  permissions: string[];
  microfrontends: Record<string, { remoteEntry: string; exposedModule: string; routePrefix: string }>;
}

export interface SnapshotApp {
  code: string;
  name: string;
  icon: string | null;
  features: string[];
}

export interface SnapshotRoleTemplate {
  name: string;
  scope: string;
  apps: string[];
  features: Record<string, string[]>;
}

export interface Snapshot {
  features: SnapshotFeature[];
  apps: SnapshotApp[];
  roleTemplates: SnapshotRoleTemplate[];
}
