import { BusinessService } from '@domain/business/services/business.service';
import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiGetBusinesses } from '../docs/business.docs';
import { CloudBusinessDto } from '../dto/entity/business.dto';

@ApiTags('Businesses')
@Controller('businesses')
export class BusinessController {
  private readonly logger = new Logger(BusinessController.name);

  constructor(private readonly businessService: BusinessService) {}

  // Returns all available business types
  @Get()
  @ApiGetBusinesses()
  findAll(): Promise<CloudBusinessDto[]> {
    this.logger.log('GET /businesses');
    return this.businessService.findAllForCloud();
  }
}
