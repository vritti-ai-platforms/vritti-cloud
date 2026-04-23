import { resolve } from 'node:path';
import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CityResponse, Reader } from 'maxmind';
import { open } from 'maxmind';

export interface GeoLocation {
  city: string;
  country: string;
}

@Injectable()
export class GeoipService implements OnModuleInit {
  private readonly logger = new Logger(GeoipService.name);
  private reader: Reader<CityResponse> | null = null;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const dbPath = this.configService.getOrThrow<string>('GEOIP_DB_PATH');
    const resolvedPath = resolve(dbPath);
    try {
      this.reader = await open<CityResponse>(resolvedPath);
      this.logger.log(`GeoIP database loaded from: ${resolvedPath}`);
    } catch {
      this.logger.warn(`GeoIP database not found at ${resolvedPath} — location will default to "Unknown"`);
    }
  }

  // Looks up city and country for an IP address
  lookup(ip: string): GeoLocation {
    if (!this.reader) {
      return { city: 'Unknown', country: 'Unknown' };
    }

    try {
      const result = this.reader.get(ip);
      if (!result) {
        return { city: 'Unknown', country: 'Unknown' };
      }

      const city = result.city?.names?.en || 'Unknown';
      const country = result.country?.iso_code || result.country?.names?.en || 'Unknown';

      return { city, country };
    } catch {
      return { city: 'Unknown', country: 'Unknown' };
    }
  }

  // Returns formatted location string like "Hyderabad, IN"
  getLocationString(ip: string): string {
    const { city, country } = this.lookup(ip);
    if (city !== 'Unknown' && country !== 'Unknown') return `${city}, ${country}`;
    if (country !== 'Unknown') return country;
    return 'Unknown';
  }
}
