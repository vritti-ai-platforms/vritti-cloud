import { Injectable, Logger } from '@nestjs/common';
import { DataTableStateService, type FieldMap, FilterProcessor } from '@vritti/api-sdk';
import { and } from '@vritti/api-sdk/drizzle-orm';
import { users } from '@/db/schema';
import { OrganizationMemberDto } from '../dto/entity/organization-member.dto';
import { OrganizationMemberTableResponseDto } from '../dto/response/organization-members-response.dto';
import { OrganizationMemberRepository } from '../repositories/organization-member.repository';

@Injectable()
export class OrganizationMemberService {
  private readonly logger = new Logger(OrganizationMemberService.name);

  private static readonly MEMBER_FIELD_MAP: FieldMap = {
    fullName: { column: users.fullName, type: 'string' },
    email: { column: users.email, type: 'string' },
    displayName: { column: users.displayName, type: 'string' },
  };

  constructor(
    private readonly organizationMemberRepository: OrganizationMemberRepository,
    private readonly dataTableStateService: DataTableStateService,
  ) {}

  // Returns organization members with server-stored filter/sort/search/pagination state
  async findForTable(userId: string, organizationId: string): Promise<OrganizationMemberTableResponseDto> {
    const { state, activeViewId } = await this.dataTableStateService.getCurrentState(userId, 'organization-members');
    const where = and(
      FilterProcessor.buildWhere(state.filters, OrganizationMemberService.MEMBER_FIELD_MAP),
      FilterProcessor.buildSearch(state.search, OrganizationMemberService.MEMBER_FIELD_MAP),
    );
    const { limit = 20, offset = 0 } = state.pagination ?? {};
    const { rows, total } = await this.organizationMemberRepository.findMembersForTable(organizationId, {
      where,
      orderBy: FilterProcessor.buildOrderBy(state.sort, OrganizationMemberService.MEMBER_FIELD_MAP),
      limit,
      offset,
    });
    const result = rows.map(OrganizationMemberDto.from);
    this.logger.log(`Fetched members table for org: ${organizationId} (${total} results, limit: ${limit}, offset: ${offset})`);
    return { result, count: total, state, activeViewId };
  }
}
