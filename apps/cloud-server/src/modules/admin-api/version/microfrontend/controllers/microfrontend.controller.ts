import {
  type MicrofrontendPlatformParam,
  MicrofrontendService,
} from '@domain/version/microfrontend/services/microfrontend.service';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateResponseDto, RequireSession, SuccessResponseDto, UserId } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import {
  ApiDeleteMicrofrontend,
  ApiFindForTableMicrofrontends,
  ApiUpsertMicrofrontend,
} from '../docs/microfrontend.docs';
import { MicrofrontendDto } from '../dto/entity/microfrontend.dto';
import { MobileMicrofrontendBodyDto } from '../dto/request/mobile-microfrontend-body.dto';
import { WebMicrofrontendBodyDto } from '../dto/request/web-microfrontend-body.dto';
import { MicrofrontendTableResponseDto } from '../dto/response/microfrontend-table-response.dto';

// Validates the :platform path param is 'web' or 'mobile'
function parsePlatform(platform: string): MicrofrontendPlatformParam {
  if (platform === 'web' || platform === 'mobile') return platform;
  throw new BadRequestException('platform', 'Platform must be "web" or "mobile".');
}

@ApiTags('Admin - Microfrontends')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.ADMIN)
@Controller('versions/:versionId/microfrontends')
export class MicrofrontendController {
  private readonly logger = new Logger(MicrofrontendController.name);

  constructor(private readonly microfrontendService: MicrofrontendService) {}

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

  // Upserts a microfrontend for the given platform (PUT = upsert by version + code)
  @Put(':platform')
  @HttpCode(HttpStatus.OK)
  @ApiUpsertMicrofrontend()
  upsert(
    @Param('versionId') versionId: string,
    @Param('platform') platform: string,
    @Body() body: WebMicrofrontendBodyDto & MobileMicrofrontendBodyDto,
  ): Promise<CreateResponseDto<MicrofrontendDto>> {
    this.logger.log(`PUT /admin-api/versions/${versionId}/microfrontends/${platform}`);
    return this.microfrontendService.upsert(parsePlatform(platform), versionId, body);
  }

  // Deletes a microfrontend by platform + ID
  @Delete(':platform/:id')
  @HttpCode(HttpStatus.OK)
  @ApiDeleteMicrofrontend()
  remove(
    @Param('versionId') versionId: string,
    @Param('platform') platform: string,
    @Param('id') id: string,
  ): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /admin-api/versions/${versionId}/microfrontends/${platform}/${id}`);
    return this.microfrontendService.remove(parsePlatform(platform), id);
  }
}
