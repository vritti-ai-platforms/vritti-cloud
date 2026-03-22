import { Injectable, Logger } from '@nestjs/common';
import { NotFoundException, SuccessResponseDto } from '@vritti/api-sdk';
import { FeatureRepository } from '../../root/repositories/feature.repository';
import { MicrofrontendRepository } from '../../../microfrontend/repositories/microfrontend.repository';
import { FeatureMicrofrontendDto } from '../dto/entity/feature-microfrontend.dto';
import type { SetFeatureMicrofrontendDto } from '../dto/request/set-feature-microfrontend.dto';
import { FeatureMicrofrontendRepository } from '../repositories/feature-microfrontend.repository';

@Injectable()
export class FeatureMicrofrontendService {
  private readonly logger = new Logger(FeatureMicrofrontendService.name);

  constructor(
    private readonly featureMicrofrontendRepository: FeatureMicrofrontendRepository,
    private readonly featureRepository: FeatureRepository,
    private readonly microfrontendRepository: MicrofrontendRepository,
  ) {}

  // Returns all microfrontend links for a feature with MF details
  async findByFeature(featureId: string): Promise<FeatureMicrofrontendDto[]> {
    const feature = await this.featureRepository.findById(featureId);
    if (!feature) {
      throw new NotFoundException('Feature not found.');
    }
    const rows = await this.featureMicrofrontendRepository.findByFeatureId(featureId);
    this.logger.log(`Fetched ${rows.length} microfrontend links for feature: ${featureId}`);
    return rows.map((row) => FeatureMicrofrontendDto.from(row));
  }

  // Sets or updates a microfrontend link for a feature (idempotent upsert)
  async set(featureId: string, microfrontendId: string, dto: SetFeatureMicrofrontendDto): Promise<FeatureMicrofrontendDto> {
    const feature = await this.featureRepository.findById(featureId);
    if (!feature) {
      throw new NotFoundException('Feature not found.');
    }
    const microfrontend = await this.microfrontendRepository.findById(microfrontendId);
    if (!microfrontend) {
      throw new NotFoundException('Microfrontend not found.');
    }

    const result = await this.featureMicrofrontendRepository.upsert({
      appVersionId: feature.appVersionId,
      featureId,
      microfrontendId,
      exposedModule: dto.exposedModule,
      routePrefix: dto.routePrefix,
    });

    this.logger.log(`Set microfrontend link: feature=${featureId}, mf=${microfrontendId}`);
    return FeatureMicrofrontendDto.from({
      id: result.id,
      featureId: result.featureId,
      microfrontendId: result.microfrontendId,
      exposedModule: result.exposedModule,
      routePrefix: result.routePrefix,
      microfrontendCode: microfrontend.code,
      microfrontendName: microfrontend.name,
      platform: microfrontend.platform,
      remoteEntry: microfrontend.remoteEntry,
    });
  }

  // Removes a microfrontend link from a feature
  async remove(featureId: string, microfrontendId: string): Promise<SuccessResponseDto> {
    const feature = await this.featureRepository.findById(featureId);
    if (!feature) {
      throw new NotFoundException('Feature not found.');
    }
    const deleted = await this.featureMicrofrontendRepository.deleteByFeatureAndMf(featureId, microfrontendId);
    if (!deleted) {
      throw new NotFoundException('Microfrontend link not found.');
    }
    this.logger.log(`Removed microfrontend link: feature=${featureId}, mf=${microfrontendId}`);
    return { success: true, message: 'Feature microfrontend link removed successfully.' };
  }
}
