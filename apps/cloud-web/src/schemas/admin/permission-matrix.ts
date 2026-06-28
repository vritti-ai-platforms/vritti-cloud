// Generic shapes for the app → feature → permission matrix, shared by role-template and plan editors.
export type Platform = 'WEB' | 'MOBILE';

export interface MatrixPermissionOption {
  featurePermissionId: string;
  code: string;
  label: string;
}

// One feature (layer 2) — its permission options + the platforms it has a route on (the catalog)
export interface MatrixFeature {
  id: string;
  code: string;
  name: string;
  lucideIcon: string | null;
  permissions: MatrixPermissionOption[];
  platforms: Platform[];
}

// One per-platform membership = the feature is in the role/plan on that platform, with its granted permission ids
export interface MatrixMembership {
  featureId: string;
  platform: Platform;
  permissions: string[];
}

// One app (layer 1): its feature catalog + the current memberships nested under it
export interface MatrixApp {
  id: string;
  code: string;
  name: string;
  icon: string | null;
  features: MatrixFeature[];
  memberships: MatrixMembership[];
}
