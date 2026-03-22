import { Injectable, Logger } from '@nestjs/common';
import { ConflictException, NotFoundException, SuccessResponseDto } from '@vritti/api-sdk';
import { AppRepository } from '../../../app-version/app/root/repositories/app.repository';
import { IndustryRepository } from '../../root/repositories/industry.repository';
import { IndustryAppDto } from '../dto/entity/industry-app.dto';
import type { AssignIndustryAppDto } from '../dto/request/assign-industry-app.dto';
import type { UpdateIndustryAppDto } from '../dto/request/update-industry-app.dto';
import { IndustryAppRepository } from '../repositories/industry-app.repository';

@Injectable()
export class IndustryAppService {
  private readonly logger = new Logger(IndustryAppService.name);

  constructor(
    private readonly industryAppRepository: IndustryAppRepository,
    private readonly industryRepository: IndustryRepository,
    private readonly appRepository: AppRepository,
  ) {}

  // Lists all apps assigned to an industry with app details
  async findByIndustry(industryId: string): Promise<IndustryAppDto[]> {
    await this.ensureIndustryExists(industryId);
    const rows = await this.industryAppRepository.findByIndustryId(industryId);
    this.logger.log(`Fetched ${rows.length} apps for industry: ${industryId}`);
    return rows.map((row) => IndustryAppDto.from(
      { id: row.id, industryId: row.industryId, appId: row.appId, isRecommended: row.isRecommended, sortOrder: row.sortOrder },
      row.appCode,
      row.appName,
    ));
  }

  // Assigns an app to an industry; validates industry and app exist and no duplicate
  async assign(industryId: string, dto: AssignIndustryAppDto): Promise<IndustryAppDto> {
    await this.ensureIndustryExists(industryId);
    const app = await this.appRepository.findById(dto.appId);
    if (!app) {
      throw new NotFoundException('App not found.');
    }
    const existing = await this.industryAppRepository.findByIndustryAndApp(industryId, dto.appId);
    if (existing) {
      throw new ConflictException({
        label: 'App Already Assigned',
        detail: 'This app is already assigned to the industry. Remove it first or update the existing assignment.',
        errors: [{ field: 'appId', message: 'Already assigned' }],
      });
    }
    const industryApp = await this.industryAppRepository.create({
      industryId,
      appId: dto.appId,
      isRecommended: dto.isRecommended ?? true,
      sortOrder: dto.sortOrder ?? 0,
    });
    this.logger.log(`Assigned app ${dto.appId} to industry ${industryId}`);
    return IndustryAppDto.from(industryApp, app.code, app.name);
  }

  // Updates isRecommended and sortOrder for an industry-app assignment
  async update(industryId: string, appId: string, dto: UpdateIndustryAppDto): Promise<SuccessResponseDto> {
    await this.ensureIndustryExists(industryId);
    const industryApp = await this.industryAppRepository.findByIndustryAndApp(industryId, appId);
    if (!industryApp) {
      throw new NotFoundException('App is not assigned to this industry.');
    }
    const updateData: { isRecommended?: boolean; sortOrder?: number } = {};
    if (dto.isRecommended !== undefined) {
      updateData.isRecommended = dto.isRecommended;
    }
    if (dto.sortOrder !== undefined) {
      updateData.sortOrder = dto.sortOrder;
    }
    await this.industryAppRepository.updateFields(industryApp.id, updateData);
    this.logger.log(`Updated industry-app assignment for industry ${industryId}, app ${appId}`);
    return { success: true, message: 'Industry app updated successfully.' };
  }

  // Removes an app from an industry
  async remove(industryId: string, appId: string): Promise<SuccessResponseDto> {
    await this.ensureIndustryExists(industryId);
    const industryApp = await this.industryAppRepository.findByIndustryAndApp(industryId, appId);
    if (!industryApp) {
      throw new NotFoundException('App is not assigned to this industry.');
    }
    await this.industryAppRepository.removeByIndustryAndApp(industryId, appId);
    this.logger.log(`Removed app ${appId} from industry ${industryId}`);
    return { success: true, message: 'App removed from industry successfully.' };
  }

  // Validates that an industry exists; throws NotFoundException otherwise
  private async ensureIndustryExists(industryId: string): Promise<void> {
    const industry = await this.industryRepository.findById(industryId);
    if (!industry) {
      throw new NotFoundException('Industry not found.');
    }
  }

}
