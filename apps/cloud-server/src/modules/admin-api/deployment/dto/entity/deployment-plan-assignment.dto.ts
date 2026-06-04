export class DeploymentPlanAssignmentBusinessDto {
  businessId: string;
  businessName: string;
  price: string | null;
  currency: string | null;
  isAssigned: boolean;
}

export class DeploymentPlanAssignmentDto {
  planId: string;
  planName: string;
  planCode: string;
  businesses: DeploymentPlanAssignmentBusinessDto[];
}
