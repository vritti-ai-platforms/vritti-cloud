import type { TableResponse } from '@vritti/quantum-ui/api-response';

export interface AdminOrganization {
  id: string;
  name: string;
  subdomain: string;
  orgIdentifier: string;
  size: string;
  planName: string;
  planCode: string;
  deploymentName: string;
  deploymentUrl: string;
  industryName: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface AdminOrganizationMember {
  id: string;
  userId: string;
  role: string;
  fullName: string;
  displayName: string;
  email: string;
  profilePictureUrl: string | null;
  createdAt: string;
}

export interface AdminOrganizationDetail extends AdminOrganization {
  planId: string;
  deploymentId: string;
  deploymentType: string;
  industryId: string;
  regionName: string;
  regionCode: string;
  cloudProviderName: string;
  cloudProviderCode: string;
}

export type OrganizationsResponse = TableResponse<AdminOrganization>;

export type OrganizationMembersResponse = TableResponse<AdminOrganizationMember>;
