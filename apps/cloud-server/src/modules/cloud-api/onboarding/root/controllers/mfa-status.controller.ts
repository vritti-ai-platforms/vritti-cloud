import { Controller, Get, HttpCode, HttpStatus, Logger, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession, UserId } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import { ApiGetMfaStatus, ApiSkipMfaSetup } from '../docs/mfa-status.docs';
import type { MfaStatusResponseDto } from '../../../../account/security/dto/response/mfa-status-response.dto';
import { MfaStatusService } from '../services/mfa-status.service';

@ApiTags('Onboarding - MFA')
@ApiBearerAuth()
@Controller('onboarding/mfa')
export class MfaStatusController {
  private readonly logger = new Logger(MfaStatusController.name);

  constructor(private readonly mfaStatusService: MfaStatusService) {}

  // Skips MFA setup and completes onboarding without enabling multi-factor auth
  @Post('skip')
  @RequireSession(SessionTypeValues.ONBOARDING)
  @HttpCode(HttpStatus.OK)
  @ApiSkipMfaSetup()
  async skipMfaSetup(@UserId() userId: string): Promise<{ success: boolean; message: string }> {
    this.logger.log(`POST /onboarding/mfa/skip - User: ${userId}`);
    return this.mfaStatusService.skipMfaSetup(userId);
  }

  // Retrieves the user's current MFA configuration and backup code count
  @Get('status')
  @RequireSession(SessionTypeValues.ONBOARDING)
  @ApiGetMfaStatus()
  async getMfaStatus(@UserId() userId: string): Promise<MfaStatusResponseDto> {
    this.logger.log(`GET /onboarding/mfa/status - User: ${userId}`);
    return this.mfaStatusService.getMfaStatus(userId);
  }
}
