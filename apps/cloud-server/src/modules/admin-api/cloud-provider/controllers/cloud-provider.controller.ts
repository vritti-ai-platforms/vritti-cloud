import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateResponseDto, RequireSession, SuccessResponseDto, UserId } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import {
  ApiCreateCloudProvider,
  ApiDeleteCloudProvider,
  ApiFindForTableCloudProviders,
  ApiUpdateCloudProvider,
} from '../docs/cloud-provider.docs';
import { CloudProviderDto } from '../dto/entity/cloud-provider.dto';
import { CreateCloudProviderDto } from '../dto/request/create-cloud-provider.dto';
import { UpdateCloudProviderDto } from '../dto/request/update-cloud-provider.dto';
import { CloudProviderTableResponseDto } from '../dto/response/cloud-providers-response.dto';
import { CloudProviderService } from '@domain/cloud-provider/services/cloud-provider.service';

@ApiTags('Admin - Cloud Providers')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.ADMIN)
@Controller('cloud-providers')
export class CloudProviderController {
  private readonly logger = new Logger(CloudProviderController.name);

  constructor(private readonly cloudProviderService: CloudProviderService) {}

  // Creates a new cloud provider
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateCloudProvider()
  create(@Body() dto: CreateCloudProviderDto): Promise<CreateResponseDto<CloudProviderDto>> {
    this.logger.log('POST /admin-api/cloud-providers');
    return this.cloudProviderService.create(dto);
  }

  // Returns cloud providers for the data table with server-stored filter/sort/search/pagination state
  @Get('table')
  @ApiFindForTableCloudProviders()
  findForTable(@UserId() userId: string): Promise<CloudProviderTableResponseDto> {
    this.logger.log('GET /admin-api/cloud-providers/table');
    return this.cloudProviderService.findForTable(userId);
  }

  // Updates a cloud provider by ID
  @Patch(':id')
  @ApiUpdateCloudProvider()
  update(@Param('id') id: string, @Body() dto: UpdateCloudProviderDto): Promise<SuccessResponseDto> {
    this.logger.log(`PATCH /admin-api/cloud-providers/${id}`);
    return this.cloudProviderService.update(id, dto);
  }

  // Deletes a cloud provider by ID
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiDeleteCloudProvider()
  delete(@Param('id') id: string): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /admin-api/cloud-providers/${id}`);
    return this.cloudProviderService.delete(id);
  }
}
