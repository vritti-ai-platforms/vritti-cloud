export interface RoleAssignment {
  id: string;
  userId: string;
  roleId: string;
  assignmentType: string;
  isActive: boolean;
  userName: string;
  userEmail: string;
  roleName: string;
  createdAt: string;
}

export interface AssignRoleData {
  userId: string;
  roleId: string;
}
