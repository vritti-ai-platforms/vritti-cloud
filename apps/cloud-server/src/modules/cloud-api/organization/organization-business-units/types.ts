export interface CoreBusinessUnit {
  id: string;
  organizationId: string;
  parentId: string | null;
  name: string;
  code: string | null;
  type: string;
  depth: number;
  path: string | null;
  isActive: boolean;
  sortOrder: number;
  timezone: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface BuRoleAssignment {
  id: string;
  userId: string;
  orgRoleId: string;
  businessUnitId: string;
  assignmentType: string;
  createdAt: Date;
  userName: string;
  userEmail: string;
  roleName: string;
}

export interface CoreOrgRole {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  scope: string;
  sourceRoleId: string | null;
  isLocked: boolean;
  appCodes: string[];
  features: Record<string, string[]>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
