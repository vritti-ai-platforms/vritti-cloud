import { Injectable, Logger } from '@nestjs/common';
import {
  ConflictException,
  CreateResponseDto,
  DataTableStateService,
  type FieldMap,
  FilterProcessor,
  NotFoundException,
  SuccessResponseDto,
} from '@vritti/api-sdk';
import { and } from '@vritti/api-sdk/drizzle-orm';
import { businesses } from '@/db/schema';
import { VersionBusinessDto } from '@/modules/admin-api/business/dto/entity/version-business.dto';
import { VersionBusinessTableResponseDto } from '@/modules/admin-api/version/business/root/dto/response/version-business-table-response.dto';
import { VersionBusinessRepository } from '../repositories/version-business.repository';

@Injectable()
export class VersionBusinessService {
  private readonly logger = new Logger(VersionBusinessService.name);

  private static readonly FIELD_MAP: FieldMap = {
    name: { column: businesses.name, type: 'string' },
    code: { column: businesses.code, type: 'string' },
  };

  constructor(
    private readonly versionBusinessRepository: VersionBusinessRepository,
    private readonly dataTableStateService: DataTableStateService,
  ) {}

  // Returns the businesses assigned to a version for the data table (server-stored filter/sort/pagination state)
  async findForTable(userId: string, versionId: string): Promise<VersionBusinessTableResponseDto> {
    const { state, activeViewId } = await this.dataTableStateService.getCurrentState(
      userId,
      `version-businesses-${versionId}`,
    );
    const where = and(
      FilterProcessor.buildWhere(state.filters, VersionBusinessService.FIELD_MAP),
      FilterProcessor.buildSearch(state.search, VersionBusinessService.FIELD_MAP),
    );
    const orderBy = FilterProcessor.buildOrderBy(state.sort, VersionBusinessService.FIELD_MAP);
    const { limit = 20, offset = 0 } = state.pagination ?? {};
    const { result, count } = await this.versionBusinessRepository.findAllForTable(versionId, {
      where,
      orderBy,
      limit,
      offset,
    });
    this.logger.log(`Fetched version-businesses table (version: ${versionId}, ${count} results)`);
    return { result: result.map(VersionBusinessDto.from), count, state, activeViewId };
  }

  // Returns the businesses assigned to a version with their per-version app count
  async findForVersion(versionId: string): Promise<VersionBusinessDto[]> {
    const rows = await this.versionBusinessRepository.findForVersion(versionId);
    this.logger.log(`Fetched ${rows.length} assigned businesses for version: ${versionId}`);
    return rows.map(VersionBusinessDto.from);
  }

  // Assigns a business to a version; rejects duplicates
  async assign(versionId: string, businessId: string): Promise<CreateResponseDto<VersionBusinessDto>> {
    const [version, business] = await Promise.all([
      this.versionBusinessRepository.findVersion(versionId),
      this.versionBusinessRepository.findBusiness(businessId),
    ]);
    if (!version) throw new NotFoundException('Version not found.');
    if (!business) throw new NotFoundException('Business not found.');

    const alreadyAssigned = await this.versionBusinessRepository.isAssigned(versionId, businessId);
    if (alreadyAssigned) {
      throw new ConflictException({
        label: 'Already Assigned',
        detail: `"${business.name}" is already assigned to this version.`,
        errors: [{ field: 'businessId', message: 'Already assigned' }],
      });
    }

    await this.versionBusinessRepository.assign(versionId, businessId);
    this.logger.log(`Assigned business ${business.name} (${businessId}) to version: ${versionId}`);
    return {
      success: true,
      message: `Business "${business.name}" assigned successfully.`,
      data: VersionBusinessDto.from({ ...business, appCount: 0 }),
    };
  }

  // Unassigns a business from a version; blocks when it has apps or role templates in the version
  async unassign(versionId: string, businessId: string): Promise<SuccessResponseDto> {
    const business = await this.versionBusinessRepository.findBusiness(businessId);
    if (!business) throw new NotFoundException('Business not found.');

    const assigned = await this.versionBusinessRepository.isAssigned(versionId, businessId);
    if (!assigned) throw new NotFoundException('Business is not assigned to this version.');

    const dependents = await this.versionBusinessRepository.countDependents(versionId, businessId);
    const parts: string[] = [];
    if (dependents.apps > 0) parts.push(`${dependents.apps} app${dependents.apps > 1 ? 's' : ''}`);
    if (dependents.roleTemplates > 0) {
      parts.push(`${dependents.roleTemplates} role template${dependents.roleTemplates > 1 ? 's' : ''}`);
    }
    if (parts.length > 0) {
      throw new ConflictException({
        label: 'Business In Use',
        detail: `Cannot unassign "${business.name}" — it has ${parts.join(' and ')} in this version. Remove those first.`,
      });
    }

    await this.versionBusinessRepository.unassign(versionId, businessId);
    this.logger.log(`Unassigned business ${business.name} (${businessId}) from version: ${versionId}`);
    return { success: true, message: `Business "${business.name}" unassigned successfully.` };
  }
}
