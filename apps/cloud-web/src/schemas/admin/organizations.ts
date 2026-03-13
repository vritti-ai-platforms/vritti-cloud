import type { TableViewState } from '@vritti/quantum-ui/table-filter';

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

export interface OrganizationsResponse {
  result: AdminOrganization[];
  count: number;
  state: TableViewState;
  activeViewId: string | null;
}

export interface OrganizationMembersResponse {
  result: AdminOrganizationMember[];
  count: number;
  state: TableViewState;
  activeViewId: string | null;
}
