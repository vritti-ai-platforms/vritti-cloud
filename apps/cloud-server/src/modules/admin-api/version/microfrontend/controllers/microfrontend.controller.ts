import { MicrofrontendService } from '@domain/version/microfrontend/services/microfrontend.service';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateResponseDto, RequireSession, SuccessResponseDto, UserId } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import {
  ApiCreateMicrofrontend,
  ApiDeleteMicrofrontend,
  ApiFindForTableMicrofrontends,
  ApiGetMicrofrontendById,
  ApiUpdateMicrofrontend,
} from '../docs/microfrontend.docs';
import { MicrofrontendDto } from '../dto/entity/microfrontend.dto';
import { CreateMicrofrontendDto } from '../dto/request/create-microfrontend.dto';
import { UpdateMicrofrontendDto } from '../dto/request/update-microfrontend.dto';
import { MicrofrontendTableResponseDto } from '../dto/response/microfrontend-table-response.dto';

@ApiTags('Admin - Microfrontends')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.ADMIN)
@Controller('versions/:versionId/microfrontends')
export class MicrofrontendController {
  private readonly logger = new Logger(MicrofrontendController.name);

  constructor(private readonly microfrontendService: MicrofrontendService) {}

  // Creates a new microfrontend within a version
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateMicrofrontend()
  create(
    @Param('versionId') versionId: string,
    @Body() dto: CreateMicrofrontendDto,
  ): Promise<CreateResponseDto<MicrofrontendDto>> {
    this.logger.log(`POST /admin-api/versions/${versionId}/microfrontends`);
    return this.microfrontendService.create({ ...dto, versionId: versionId });
  }

  // Returns microfrontends for the data table filtered by version
  @Get('table')
  @ApiFindForTableMicrofrontends()
  findForTable(
    @UserId() userId: string,
    @Param('versionId') versionId: string,
  ): Promise<MicrofrontendTableResponseDto> {
    this.logger.log(`GET /admin-api/versions/${versionId}/microfrontends/table`);
    return this.microfrontendService.findForTable(userId, versionId);
  }

  // Returns a single microfrontend by ID
  @Get(':id')
  @ApiGetMicrofrontendById()
  findById(@Param('versionId') _versionId: string, @Param('id') id: string): Promise<MicrofrontendDto> {
    this.logger.log(`GET /admin-api/versions/${_versionId}/microfrontends/${id}`);
    return this.microfrontendService.findById(id);
  }

  // Updates a microfrontend by ID
  @Patch(':id')
  @ApiUpdateMicrofrontend()
  update(
    @Param('versionId') _versionId: string,
    @Param('id') id: string,
    @Body() dto: UpdateMicrofrontendDto,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`PATCH /admin-api/versions/${_versionId}/microfrontends/${id}`);
    return this.microfrontendService.update(id, dto);
  }

  // Deletes a microfrontend by ID
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiDeleteMicrofrontend()
  delete(@Param('versionId') _versionId: string, @Param('id') id: string): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /admin-api/versions/${_versionId}/microfrontends/${id}`);
    return this.microfrontendService.delete(id);
  }
}
