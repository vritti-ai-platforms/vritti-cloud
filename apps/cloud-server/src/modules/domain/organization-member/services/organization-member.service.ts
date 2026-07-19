import { Injectable, Logger } from '@nestjs/common';
import { DataTableStateService } from '@vritti/api-sdk/data-table';
import { type FieldMap, FilterProcessor } from '@vritti/api-sdk/database';
import { and } from '@vritti/api-sdk/drizzle-orm';
import { users } from '@/db/schema';
import { OrganizationMemberDto } from '@/modules/admin-api/deployment/organization/member/dto/entity/organization-member.dto';
import { OrganizationMemberTableResponseDto } from '@/modules/admin-api/deployment/organization/member/dto/response/organization-members-response.dto';
import { OrganizationMemberDomainRepository } from '../repositories/organization-member.repository';

@Injectable()
export class OrganizationMemberDomainService {
  private readonly logger = new Logger(OrganizationMemberDomainService.name);

  private static readonly MEMBER_FIELD_MAP: FieldMap = {
    fullName: { column: users.fullName, type: 'string' },
    email: { column: users.email, type: 'string' },
    displayName: { column: users.displayName, type: 'string' },
  };

  constructor(
    private readonly organizationMemberRepository: OrganizationMemberDomainRepository,
    private readonly dataTableStateService: DataTableStateService,
  ) {}

  // Returns organization members with server-stored filter/sort/search/pagination state
  async findForTable(userId: string, organizationId: string): Promise<OrganizationMemberTableResponseDto> {
    const { state, activeViewId } = await this.dataTableStateService.getCurrentState(userId, 'organization-members');
    const where = and(
      FilterProcessor.buildWhere(state.filters, OrganizationMemberDomainService.MEMBER_FIELD_MAP),
      FilterProcessor.buildSearch(state.search, OrganizationMemberDomainService.MEMBER_FIELD_MAP),
    );
    const { limit = 20, offset = 0 } = state.pagination ?? {};
    const { rows, total } = await this.organizationMemberRepository.findMembersForTable(organizationId, {
      where,
      orderBy: FilterProcessor.buildOrderBy(state.sort, OrganizationMemberDomainService.MEMBER_FIELD_MAP),
      limit,
      offset,
    });
    const result = rows.map(OrganizationMemberDto.from);
    this.logger.log(
      `Fetched members table for org: ${organizationId} (${total} results, limit: ${limit}, offset: ${offset})`,
    );
    return { result, count: total, state, activeViewId };
  }
}
