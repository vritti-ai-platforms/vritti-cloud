import type { BuFeatureLocks, BuMatrix } from '@vritti/api-sdk/catalog-resolver';
import type { SuccessResponse } from '@vritti/quantum-ui/api-response';
import { axios } from '@vritti/quantum-ui/axios';
import type {
  BusinessUnit,
  BusinessUnitsResponse,
  CreateBusinessUnitData,
  UpdateBusinessUnitData,
} from '@/schemas/cloud/org-business-units';
import type { Role } from '@/schemas/cloud/roles';

// Fetches all business units for the organization
export function getOrgBusinessUnits(orgId: string): Promise<BusinessUnitsResponse> {
  return axios.get<BusinessUnitsResponse>(`cloud-api/organizations/${orgId}/business-units`).then((r) => r.data);
}

// Fetches a single business unit by ID
export function getOrgBusinessUnit(orgId: string, buId: string): Promise<BusinessUnit> {
  return axios.get<BusinessUnit>(`cloud-api/organizations/${orgId}/business-units/${buId}`).then((r) => r.data);
}

// Creates a new business unit
export function createOrgBusinessUnit({
  orgId,
  data,
}: {
  orgId: string;
  data: CreateBusinessUnitData;
}): Promise<BusinessUnit> {
  return axios.post<BusinessUnit>(`cloud-api/organizations/${orgId}/business-units`, data).then((r) => r.data);
}

// Updates a business unit
export function updateOrgBusinessUnit({
  orgId,
  buId,
  data,
}: {
  orgId: string;
  buId: string;
  data: UpdateBusinessUnitData;
}): Promise<SuccessResponse> {
  return axios
    .patch<SuccessResponse>(`cloud-api/organizations/${orgId}/business-units/${buId}`, data)
    .then((r) => r.data);
}

// Fetches role assignments for a business unit
export function getBURoleAssignments(orgId: string, buId: string): Promise<BURoleAssignment[]> {
  return axios
    .get<BURoleAssignment[]>(`cloud-api/organizations/${orgId}/business-units/${buId}/role-assignments`)
    .then((r) => r.data);
}

// Assigns a role to a user at a business unit
export function assignBURole({
  orgId,
  buId,
  data,
}: {
  orgId: string;
  buId: string;
  data: { userId: string; roleId: string };
}): Promise<SuccessResponse> {
  return axios
    .post<SuccessResponse>(`cloud-api/organizations/${orgId}/business-units/${buId}/role-assignments`, data)
    .then((r) => r.data);
}

// Removes a role assignment from a business unit
export function removeBURoleAssignment({
  orgId,
  buId,
  assignmentId,
}: {
  orgId: string;
  buId: string;
  assignmentId: string;
}): Promise<void> {
  return axios
    .delete(`cloud-api/organizations/${orgId}/business-units/${buId}/role-assignments/${assignmentId}`)
    .then(() => undefined);
}

export interface BURoleAssignment {
  id: string;
  userId: string;
  roleId: string;
  businessUnitId: string;
  assignmentType: string;
  isActive: boolean;
  userName: string;
  userEmail: string;
  roleName: string;
  createdAt: string;
}

// Fetches the BU permission matrix — snapshot-driven: all apps/features/permissions with per-platform lock state
export function getBuPermissionMatrix(orgId: string, buId: string): Promise<BuMatrix> {
  return axios.get<BuMatrix>(`cloud-api/organizations/${orgId}/business-units/${buId}/permissions`).then((r) => r.data);
}

// Replaces the BU's lock deny-list (code-keyed; platform null locks the feature there, string[] locks those codes)
export function setBuPermissions({
  orgId,
  buId,
  locks,
}: {
  orgId: string;
  buId: string;
  locks: BuFeatureLocks;
}): Promise<SuccessResponse> {
  return axios
    .put<SuccessResponse>(`cloud-api/organizations/${orgId}/business-units/${buId}/permissions`, { locks })
    .then((r) => r.data);
}

// Fetches roles compatible with a business unit's assigned apps
export function getCompatibleRoles(orgId: string, buId: string): Promise<Role[]> {
  return axios
    .get<Role[]>(`cloud-api/organizations/${orgId}/business-units/${buId}/compatible-roles`)
    .then((r) => r.data);
}

// Deletes a business unit
export function deleteOrgBusinessUnit({ orgId, buId }: { orgId: string; buId: string }): Promise<void> {
  return axios.delete(`cloud-api/organizations/${orgId}/business-units/${buId}`).then(() => undefined);
}
