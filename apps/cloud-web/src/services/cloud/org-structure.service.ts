import { axios } from '@vritti/quantum-ui/axios';
import type { CreateResponse, SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type {
  CreateLegalEntityData,
  CreateSiteGroupData,
  CreateTaxRegistrationData,
  LegalEntity,
  OrgStructureResponse,
  SiteGroup,
  TaxRegistration,
  UpdateLegalEntityData,
  UpdateSiteGroupData,
} from '@/schemas/cloud/org-structure';

// Fetches the organization's full structure
export function getOrgStructure(orgId: string): Promise<OrgStructureResponse> {
  return axios.get<OrgStructureResponse>(`cloud-api/organizations/${orgId}/structure`).then((r) => r.data);
}

// Creates a legal entity
export function createLegalEntity({
  orgId,
  data,
}: {
  orgId: string;
  data: CreateLegalEntityData;
}): Promise<CreateResponse<LegalEntity>> {
  return axios
    .post<CreateResponse<LegalEntity>>(`cloud-api/organizations/${orgId}/legal-entities`, data)
    .then((r) => r.data);
}

// Updates a legal entity
export function updateLegalEntity({
  orgId,
  leId,
  data,
}: {
  orgId: string;
  leId: string;
  data: UpdateLegalEntityData;
}): Promise<SuccessResponse> {
  return axios
    .patch<SuccessResponse>(`cloud-api/organizations/${orgId}/legal-entities/${leId}`, data)
    .then((r) => r.data);
}

// Reorders sibling legal entities
export function reorderLegalEntities({ orgId, ids }: { orgId: string; ids: string[] }): Promise<SuccessResponse> {
  return axios
    .patch<SuccessResponse>(`cloud-api/organizations/${orgId}/legal-entities/reorder`, { ids })
    .then((r) => r.data);
}

// Creates a tax registration under a legal entity
export function createTaxRegistration({
  orgId,
  leId,
  data,
}: {
  orgId: string;
  leId: string;
  data: CreateTaxRegistrationData;
}): Promise<CreateResponse<TaxRegistration>> {
  return axios
    .post<CreateResponse<TaxRegistration>>(
      `cloud-api/organizations/${orgId}/legal-entities/${leId}/registrations`,
      data,
    )
    .then((r) => r.data);
}

// Deletes a legal entity
export function deleteLegalEntity({ orgId, leId }: { orgId: string; leId: string }): Promise<SuccessResponse> {
  return axios.delete<SuccessResponse>(`cloud-api/organizations/${orgId}/legal-entities/${leId}`).then((r) => r.data);
}

// Creates a site group
export function createSiteGroup({
  orgId,
  data,
}: {
  orgId: string;
  data: CreateSiteGroupData;
}): Promise<CreateResponse<SiteGroup>> {
  return axios
    .post<CreateResponse<SiteGroup>>(`cloud-api/organizations/${orgId}/structure/site-groups`, data)
    .then((r) => r.data);
}

// Updates a site group
export function updateSiteGroup({
  orgId,
  groupId,
  data,
}: {
  orgId: string;
  groupId: string;
  data: UpdateSiteGroupData;
}): Promise<SuccessResponse> {
  return axios
    .patch<SuccessResponse>(`cloud-api/organizations/${orgId}/structure/site-groups/${groupId}`, data)
    .then((r) => r.data);
}

// Reorders sibling site groups
export function reorderSiteGroups({ orgId, ids }: { orgId: string; ids: string[] }): Promise<SuccessResponse> {
  return axios
    .patch<SuccessResponse>(`cloud-api/organizations/${orgId}/structure/site-groups/reorder`, { ids })
    .then((r) => r.data);
}

// Reparents a site group under a new parent
export function reparentSiteGroup({
  orgId,
  groupId,
  parentId,
}: {
  orgId: string;
  groupId: string;
  parentId: string | null;
}): Promise<SuccessResponse> {
  return axios
    .patch<SuccessResponse>(`cloud-api/organizations/${orgId}/structure/site-groups/${groupId}/reparent`, { parentId })
    .then((r) => r.data);
}

// Deletes a site group
export function deleteSiteGroup({ orgId, groupId }: { orgId: string; groupId: string }): Promise<SuccessResponse> {
  return axios
    .delete<SuccessResponse>(`cloud-api/organizations/${orgId}/structure/site-groups/${groupId}`)
    .then((r) => r.data);
}

// Deletes a tax registration
export function deleteTaxRegistration({
  orgId,
  leId,
  regId,
}: {
  orgId: string;
  leId: string;
  regId: string;
}): Promise<SuccessResponse> {
  return axios
    .delete<SuccessResponse>(`cloud-api/organizations/${orgId}/legal-entities/${leId}/registrations/${regId}`)
    .then((r) => r.data);
}
