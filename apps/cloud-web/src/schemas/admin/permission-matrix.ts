// Generic shapes for the app → feature → permission matrix, shared by role-template grants and plan unlocks.
export type Platform = 'WEB' | 'MOBILE';

export interface MatrixPermissionOption {
  featurePermissionId: string;
  code: string;
  label: string;
}

// One feature (layer 2) — its permissions + the platforms it has a route on
export interface MatrixFeature {
  id: string;
  code: string;
  name: string;
  icon: string | null;
  permissions: MatrixPermissionOption[];
  platforms: Platform[];
}

// One app (layer 1) with the features it owns
export interface MatrixApp {
  id: string;
  code: string;
  name: string;
  icon: string | null;
  features: MatrixFeature[];
}

// One platform-scoped grant/unlock
export interface MatrixGrant {
  featurePermissionId: string;
  platform: Platform;
}
