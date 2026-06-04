export type AppStatus = 'included' | 'addon' | 'unavailable' | 'enabled';

export interface OrgAppFeature {
  code: string;
  name: string;
  type: string;
}

export interface OrgAppPrice {
  monthlyPrice: string;
  currency: string;
}

export interface OrgApp {
  id: string;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  status: AppStatus;
  price: OrgAppPrice | null;
  features: OrgAppFeature[];
}

export interface OrgAppsResponse {
  result: OrgApp[];
}

export interface PurchaseAddonData {
  businessUnitIds: string[];
}
