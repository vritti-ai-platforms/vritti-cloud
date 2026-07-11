import { Injectable, Logger } from '@nestjs/common';
import { DataTableStateService } from '@vritti/api-sdk/data-table';
import {
  CreateResponseDto,
  type FieldMap,
  FilterProcessor,
  SelectOptionsQueryDto,
  type SelectQueryResult,
  SuccessResponseDto,
} from '@vritti/api-sdk/database';
import { and, eq, sql } from '@vritti/api-sdk/drizzle-orm';
import { BadRequestException, ConflictException, NotFoundException } from '@vritti/api-sdk/exceptions';
import { planPrices, plans } from '@/db/schema';
import { PlanDto } from '@/modules/admin-api/version/business/plan/root/dto/entity/plan.dto';
import type { CreatePlanDto } from '@/modules/admin-api/version/business/plan/root/dto/request/create-plan.dto';
import type { UpdatePlanDto } from '@/modules/admin-api/version/business/plan/root/dto/request/update-plan.dto';
import { PlansTableResponseDto } from '@/modules/admin-api/version/business/plan/root/dto/response/plans-table-response.dto';
import { CatalogSyncService } from '@/modules/core-server/services/catalog-sync.service';
import { PlanRepository } from '../repositories/plan.repository';

@Injectable()
export class PlanService {
  private readonly logger = new Logger(PlanService.name);

  private static readonly FIELD_MAP: FieldMap = {
    name: { column: plans.name, type: 'string' },
    code: { column: plans.code, type: 'string' },
    businessId: { column: plans.businessId, type: 'string' },
    // Aggregates are invalid in WHERE — filter via a correlated price-count subquery honoring the operator
    priceCount: {
      expression: (value, operator) => {
        const priceCount = sql`(SELECT count(*) FROM ${planPrices} WHERE ${planPrices.planId} = ${plans.id})`;
        switch (operator) {
          case 'notEquals':
            return sql`${priceCount} <> ${Number(value)}`;
          case 'gt':
            return sql`${priceCount} > ${Number(value)}`;
          case 'gte':
            return sql`${priceCount} >= ${Number(value)}`;
          case 'lt':
            return sql`${priceCount} < ${Number(value)}`;
          case 'lte':
            return sql`${priceCount} <= ${Number(value)}`;
          default:
            return sql`${priceCount} = ${Number(value)}`;
        }
      },
      type: 'number',
    },
  };

  constructor(
    private readonly planRepository: PlanRepository,
    private readonly dataTableStateService: DataTableStateService,
    private readonly catalogSyncService: CatalogSyncService,
  ) {}

  // Returns paginated plan options for the select component (scoped to a version + business)
  findForSelect(
    query: SelectOptionsQueryDto & { versionId?: string; businessId?: string },
  ): Promise<SelectQueryResult> {
    this.logger.log(
      `Fetched plan select options (limit: ${query.limit}, offset: ${query.offset}, search: ${query.search})`,
    );
    return this.planRepository.findForSelect({
      value: query.valueKey || 'code',
      label: query.labelKey || 'name',
      description: query.descriptionKey,
      groupIdKey: query.groupIdKey,
      search: query.search,
      limit: query.limit,
      offset: query.offset,
      values: query.values,
      excludeIds: query.excludeIds,
      orderBy: { name: 'asc' },
      // Custom plans are bespoke to one org and never offered in the public selector
      where: {
        isCustom: false,
        ...(query.versionId ? { versionId: query.versionId } : {}),
        ...(query.businessId ? { businessId: query.businessId } : {}),
      },
    });
  }

  // Creates a version+business-scoped plan; custom plans also set org.planCode on the attached org
  async create(versionId: string, businessId: string, dto: CreatePlanDto): Promise<CreateResponseDto<PlanDto>> {
    const existing = await this.planRepository.findByVersionBusinessCode(versionId, businessId, dto.code);
    if (existing) {
      throw new ConflictException({
        label: 'Code Already Exists',
        detail: 'A plan with this code already exists for this version and business.',
        errors: [{ field: 'code', message: 'Duplicate code' }],
      });
    }

    let attachOrgId: string | undefined;
    if (dto.isCustom) {
      if (!dto.organizationId) {
        throw new BadRequestException({
          label: 'Organization Required',
          detail: 'A custom plan must be attached to an organization.',
          errors: [{ field: 'organizationId', message: 'Required' }],
        });
      }
      const org = await this.planRepository.findOrgForAttach(dto.organizationId);
      if (!org) {
        throw new BadRequestException({
          label: 'Invalid Organization',
          detail: 'The specified organization does not exist.',
          errors: [{ field: 'organizationId', message: 'Not found' }],
        });
      }
      if (org.businessId !== businessId) {
        throw new BadRequestException({
          label: 'Business Mismatch',
          detail: "The organization's business does not match this plan's business.",
          errors: [{ field: 'organizationId', message: 'Wrong business' }],
        });
      }
      attachOrgId = org.id;
    }

    const plan = await this.planRepository.create({
      versionId,
      businessId,
      name: dto.name,
      code: dto.code,
      content: dto.content,
      maxSites: dto.maxSites,
      isCustom: dto.isCustom ?? false,
    });

    if (attachOrgId) {
      await this.planRepository.setOrgPlanCode(attachOrgId, plan.code);
      // Re-issue the org's signed entitlement so core resolves with the new plan code
      await this.catalogSyncService.syncOrgEntitlement(attachOrgId);
    }

    this.logger.log(`Created ${plan.isCustom ? 'custom ' : ''}plan: ${plan.name} (${plan.id})`);
    return { success: true, message: `Plan "${plan.name}" created successfully.`, data: PlanDto.from(plan) };
  }

  // Returns plans for a version + business with server-stored filter/sort/search/pagination state
  async findForTable(userId: string, versionId: string, businessId: string): Promise<PlansTableResponseDto> {
    const { state, activeViewId } = await this.dataTableStateService.getCurrentState(
      userId,
      `plans-${versionId}-${businessId}`,
    );
    const where = and(
      eq(plans.versionId, versionId),
      eq(plans.businessId, businessId),
      FilterProcessor.buildWhere(state.filters, PlanService.FIELD_MAP),
      FilterProcessor.buildSearch(state.search, PlanService.FIELD_MAP),
    );
    const { limit = 20, offset = 0 } = state.pagination ?? {};
    const { rows, total } = await this.planRepository.findAllWithCounts({
      where,
      orderBy: FilterProcessor.buildOrderBy(state.sort, PlanService.FIELD_MAP),
      limit,
      offset,
    });
    const result = rows.map((plan) =>
      PlanDto.from(plan, {
        priceCount: plan.priceCount,
        countryCount: plan.countryCount,
        businessName: plan.businessName,
      }),
    );
    this.logger.log(`Fetched plans table (${total} results, limit: ${limit}, offset: ${offset})`);
    return { result, count: total, state, activeViewId };
  }

  // Finds a plan by ID with canDelete flag; throws NotFoundException if not found
  async findById(id: string): Promise<PlanDto> {
    const plan = await this.planRepository.findById(id);
    if (!plan) {
      throw new NotFoundException('Plan not found.');
    }
    const { priceCount, orgCount, businessName, countryCount } = await this.planRepository.getReferenceCounts(
      id,
      plan.businessId,
      plan.code,
    );
    const canDelete = priceCount === 0 && orgCount === 0;
    const attachedOrgName = plan.isCustom
      ? await this.planRepository.findAttachedOrgName(plan.businessId, plan.code)
      : null;
    this.logger.log(`Fetched plan: ${id}`);
    return PlanDto.from(plan, { priceCount, orgCount, countryCount, businessName, attachedOrgName }, canDelete);
  }

  // Updates a plan by ID; throws NotFoundException if not found, ConflictException on duplicate code
  async update(id: string, dto: UpdatePlanDto): Promise<SuccessResponseDto> {
    const existing = await this.planRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Plan not found.');
    }
    if (dto.code) {
      const existingCode = await this.planRepository.findByVersionBusinessCode(
        existing.versionId,
        existing.businessId,
        dto.code,
      );
      if (existingCode && existingCode.id !== id) {
        throw new ConflictException({
          label: 'Code Already Exists',
          detail: 'A plan with this code already exists for this version and business.',
          errors: [{ field: 'code', message: 'Duplicate code' }],
        });
      }
    }
    const plan = await this.planRepository.update(id, dto);
    // Renaming the code breaks orgs that reference the plan by its old code — re-point them
    if (dto.code && dto.code !== existing.code) {
      const recoded = await this.planRepository.recodeOrganizations(existing.businessId, existing.code, dto.code);
      if (recoded.length > 0) {
        this.logger.log(`Re-pointed ${recoded.length} org(s) from plan code "${existing.code}" to "${dto.code}"`);
        // Re-issue each re-pointed org's signed entitlement so core resolves with the new plan code
        for (const orgId of recoded) {
          await this.catalogSyncService.syncOrgEntitlement(orgId);
        }
      }
    }
    this.logger.log(`Updated plan: ${plan.name} (${plan.id})`);
    return { success: true, message: `Plan "${plan.name}" updated successfully.` };
  }

  // Deletes a plan by ID; throws NotFoundException if not found, ConflictException if referenced
  async delete(id: string): Promise<SuccessResponseDto> {
    const existing = await this.planRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Plan not found.');
    }
    const { priceCount, orgCount } = await this.planRepository.getReferenceCounts(
      id,
      existing.businessId,
      existing.code,
    );
    if (priceCount > 0 || orgCount > 0) {
      throw new ConflictException({
        label: 'Plan In Use',
        detail: `Cannot delete "${existing.name}" — it has prices or attached organizations. Remove those first.`,
      });
    }
    await this.planRepository.delete(id);
    this.logger.log(`Deleted plan: ${existing.name} (${existing.id})`);
    return { success: true, message: `Plan "${existing.name}" deleted successfully.` };
  }
}
