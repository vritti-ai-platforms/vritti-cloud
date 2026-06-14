type AppStatus = 'included' | 'addon' | 'unavailable' | 'enabled';

interface OrgAppFeature {
  code: string;
  name: string;
  type: string;
}

interface OrgAppPrice {
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
