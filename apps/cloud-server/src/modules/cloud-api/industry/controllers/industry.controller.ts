import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiGetIndustries } from '../docs/industry.docs';
import { CloudIndustryDto } from '../dto/entity/industry.dto';
import { IndustryService } from '@domain/industry/services/industry.service';

@ApiTags('Industries')
@Controller('industries')
export class IndustryController {
  private readonly logger = new Logger(IndustryController.name);

  constructor(private readonly industryService: IndustryService) {}

  // Returns all available industry types
  @Get()
  @ApiGetIndustries()
  findAll(): Promise<CloudIndustryDto[]> {
    this.logger.log('GET /industries');
    return this.industryService.findAllForCloud();
  }

}
