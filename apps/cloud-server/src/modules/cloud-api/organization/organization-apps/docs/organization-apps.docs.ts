import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { SiteMatrixResponseDto } from '../../dto/response/site-matrix.response.dto';

export function ApiGetOrgPermissions() {
  return applyDecorators(
    ApiOperation({
      summary: 'Organization permission catalog',
      description:
        'Returns every app/feature/permission for the organization with per-platform plan-inclusion (inPlan/availableIn) — powers the role permission picker and the read-only Plan Overview.',
    }),
    ApiParam({ name: 'orgId', type: String, description: 'Organization ID' }),
    ApiResponse({ status: 200, description: 'Catalog retrieved successfully.', type: SiteMatrixResponseDto }),
    ApiResponse({ status: 404, description: 'Organization not found.' }),
  );
}
