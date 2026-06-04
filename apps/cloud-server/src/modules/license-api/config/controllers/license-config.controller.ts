import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@vritti/api-sdk';
import { LicenseConfigService } from '../services/license-config.service';

@ApiTags('License')
@Controller('license-api/config')
export class LicenseConfigController {
  constructor(private readonly licenseConfigService: LicenseConfigService) {}

  @Get(':orgIdentifier')
  @Public()
  async getConfig(@Param('orgIdentifier') orgIdentifier: string) {
    return this.licenseConfigService.getConfig(orgIdentifier);
  }
}
