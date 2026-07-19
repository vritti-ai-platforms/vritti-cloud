import { BusinessDomainService } from '@domain/business/services/business.service';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession, UserId } from '@vritti/api-sdk/auth';
import { CreateResponseDto, SuccessResponseDto } from '@vritti/api-sdk/database';
import { SessionTypeValues } from '@/db/schema';
import {
  ApiCreateBusiness,
  ApiDeleteBusiness,
  ApiFindForTableBusinesses,
  ApiUpdateBusiness,
} from '../docs/business.docs';
import { BusinessDto } from '../dto/entity/business.dto';
import { CreateBusinessDto } from '../dto/request/create-business.dto';
import { UpdateBusinessDto } from '../dto/request/update-business.dto';
import { BusinessTableResponseDto } from '../dto/response/businesses-response.dto';

@ApiTags('Admin - Businesses')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.ADMIN)
@Controller('businesses')
export class BusinessController {
  private readonly logger = new Logger(BusinessController.name);

  constructor(private readonly businessService: BusinessDomainService) {}

  // Creates a new business
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateBusiness()
  create(@Body() dto: CreateBusinessDto): Promise<CreateResponseDto<BusinessDto>> {
    this.logger.log('POST /admin-api/businesses');
    return this.businessService.create(dto);
  }

  // Returns businesses for the data table with server-stored filter/sort/search/pagination state
  @Get('table')
  @ApiFindForTableBusinesses()
  findForTable(
    @UserId() userId: string,
    @Query('searchColumn') searchColumn?: string,
    @Query('searchValue') searchValue?: string,
  ): Promise<BusinessTableResponseDto> {
    this.logger.log('GET /admin-api/businesses/table');
    return this.businessService.findForTable(userId, searchColumn, searchValue);
  }

  // Updates a business by ID
  @Patch(':id')
  @ApiUpdateBusiness()
  update(@Param('id') id: string, @Body() dto: UpdateBusinessDto): Promise<SuccessResponseDto> {
    this.logger.log(`PATCH /admin-api/businesses/${id}`);
    return this.businessService.update(id, dto);
  }

  // Deletes a business by ID
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiDeleteBusiness()
  delete(@Param('id') id: string): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /admin-api/businesses/${id}`);
    return this.businessService.delete(id);
  }
}
