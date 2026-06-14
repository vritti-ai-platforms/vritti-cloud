import { Injectable, Logger } from '@nestjs/common';
import { ConflictException, CreateResponseDto, NotFoundException, SuccessResponseDto } from '@vritti/api-sdk';
import { MarketCountryDto } from '@/modules/admin-api/market/market-country/dto/entity/market-country.dto';
import type { AssignMarketCountryDto } from '@/modules/admin-api/market/market-country/dto/request/assign-market-country.dto';
import { MarketRepository } from '../repositories/market.repository';
import { MarketCountryRepository } from '../repositories/market-country.repository';

@Injectable()
export class MarketCountryService {
  private readonly logger = new Logger(MarketCountryService.name);

  constructor(
    private readonly marketCountryRepository: MarketCountryRepository,
    private readonly marketRepository: MarketRepository,
  ) {}

  // Lists all countries mapped to a market
  async findByMarket(marketId: string): Promise<MarketCountryDto[]> {
    await this.ensureMarketExists(marketId);
    const rows = await this.marketCountryRepository.findByMarketId(marketId);
    this.logger.log(`Fetched ${rows.length} countries for market: ${marketId}`);
    return rows.map((row) =>
      MarketCountryDto.from({
        id: row.id,
        marketId,
        countryId: row.countryId,
        countryCode: row.code,
        countryName: row.name,
      }),
    );
  }

  // Assigns a country to a market; ensures market exists and country is not already mapped elsewhere
  async assign(marketId: string, dto: AssignMarketCountryDto): Promise<CreateResponseDto<MarketCountryDto>> {
    await this.ensureMarketExists(marketId);
    const existing = await this.marketCountryRepository.findByCountryId(dto.countryId);
    if (existing) {
      const message = existing.marketId === marketId ? 'Already assigned to this market' : 'Assigned to another market';
      throw new ConflictException({
        label: 'Country Already Assigned',
        detail: 'This country already belongs to a market. A country can belong to exactly one market.',
        errors: [{ field: 'countryId', message }],
      });
    }
    const marketCountry = await this.marketCountryRepository.create({ marketId, countryId: dto.countryId });
    const rows = await this.marketCountryRepository.findByMarketId(marketId);
    const row = rows.find((r) => r.countryId === dto.countryId);
    this.logger.log(`Assigned country ${dto.countryId} to market ${marketId}`);
    return {
      success: true,
      message: 'Country assigned to market successfully.',
      data: MarketCountryDto.from({
        id: marketCountry.id,
        marketId,
        countryId: dto.countryId,
        countryCode: row?.code ?? '',
        countryName: row?.name ?? '',
      }),
    };
  }

  // Removes a country mapping from a market
  async remove(marketId: string, countryId: string): Promise<SuccessResponseDto> {
    await this.ensureMarketExists(marketId);
    const mapping = await this.marketCountryRepository.findByMarketAndCountry(marketId, countryId);
    if (!mapping) {
      throw new NotFoundException('Country is not assigned to this market.');
    }
    await this.marketCountryRepository.removeByMarketAndCountry(marketId, countryId);
    this.logger.log(`Removed country ${countryId} from market ${marketId}`);
    return { success: true, message: 'Country removed from market successfully.' };
  }

  // Validates that a market exists; throws NotFoundException otherwise
  private async ensureMarketExists(marketId: string): Promise<void> {
    const market = await this.marketRepository.findById(marketId);
    if (!market) {
      throw new NotFoundException('Market not found.');
    }
  }
}
