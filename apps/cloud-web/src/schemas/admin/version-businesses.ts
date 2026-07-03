import type { TableResponse } from '@vritti/quantum-ui/types/api-response';
import { z } from '@vritti/quantum-ui/zod';

export interface VersionBusiness {
  id: string;
  name: string;
  code: string;
  description: string | null;
  appCount: number;
}

export type VersionBusinessesTableResponse = TableResponse<VersionBusiness>;

export const assignVersionBusinessSchema = z.object({
  businessId: z.string().min(1, 'Please select a business'),
});

export type AssignVersionBusinessData = z.infer<typeof assignVersionBusinessSchema>;
