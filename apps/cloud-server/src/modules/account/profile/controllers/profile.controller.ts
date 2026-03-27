import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Post, Put, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession, SuccessResponseDto, UserId } from '@vritti/api-sdk';
import type { FastifyRequest } from 'fastify';
import type { VerificationChannel } from '@/db/schema';
import { SessionTypeValues } from '@/db/schema';
import { UserDto } from '../../../cloud-api/user/dto/entity/user.dto';
import {
  ApiDeleteAccount,
  ApiGetProfile,
  ApiIdentityVerificationStart,
  ApiResendTargetOtp,
  ApiSubmitNewTarget,
  ApiUpdateProfile,
  ApiVerifyIdentity,
  ApiVerifyNewTarget,
} from '../docs/profile.docs';
import {
  IdentityVerificationStartDto,
  ResendTargetOtpDto,
  SubmitNewTargetDto,
  VerifyIdentityDto,
  VerifyNewTargetDto,
} from '../dto/request/contact-change.dto';
import { ProfileService } from '../services/profile.service';

@ApiTags('Account - Profile')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.CLOUD, SessionTypeValues.ADMIN)
@Controller('account/profile')
export class ProfileController {
  private readonly logger = new Logger(ProfileController.name);

  constructor(private readonly profileService: ProfileService) {}

  // Returns the authenticated user's profile
  @Get()
  @ApiGetProfile()
  async getProfile(@UserId() userId: string): Promise<UserDto> {
    this.logger.log(`GET /account/profile - userId: ${userId}`);
    return this.profileService.getProfile(userId);
  }

  // Updates the authenticated user's profile information (supports JSON and multipart form data)
  @Put()
  @ApiUpdateProfile()
  async updateProfile(@UserId() userId: string, @Req() request: FastifyRequest): Promise<SuccessResponseDto> {
    this.logger.log(`PUT /account/profile - userId: ${userId}`);
    return this.profileService.updateProfile(userId, request);
  }

  // Deactivates the authenticated user's account and invalidates all sessions
  @Delete()
  @ApiDeleteAccount()
  async deleteAccount(@UserId() userId: string): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /account/profile - userId: ${userId}`);
    return this.profileService.deleteAccount(userId);
  }

  // Sends OTP to current contact for identity verification
  @Post('identity-verification-start')
  @HttpCode(HttpStatus.OK)
  @ApiIdentityVerificationStart()
  async identityVerificationStart(
    @UserId() userId: string,
    @Body() dto: IdentityVerificationStartDto,
  ): Promise<{ expiresAt: Date }> {
    this.logger.log(`POST /account/profile/identity-verification-start - userId: ${userId}`);
    return this.profileService.identityVerificationStart(userId, dto.channel as VerificationChannel);
  }

  // Verifies identity OTP sent to current contact
  @Post('verify-identity')
  @HttpCode(HttpStatus.OK)
  @ApiVerifyIdentity()
  async verifyIdentity(@UserId() userId: string, @Body() dto: VerifyIdentityDto): Promise<SuccessResponseDto> {
    this.logger.log(`POST /account/profile/verify-identity - userId: ${userId}`);
    return this.profileService.verifyIdentity(userId, dto.channel as VerificationChannel, dto.otpCode);
  }

  // Validates new target and sends verification OTP to it
  @Post('submit-new-target')
  @HttpCode(HttpStatus.OK)
  @ApiSubmitNewTarget()
  async submitNewTarget(@UserId() userId: string, @Body() dto: SubmitNewTargetDto): Promise<{ expiresAt: Date }> {
    this.logger.log(`POST /account/profile/submit-new-target - userId: ${userId}`);
    return this.profileService.submitNewTarget(userId, dto.channel as VerificationChannel, dto.target);
  }

  // Verifies OTP sent to new target and completes the change
  @Post('verify-new-target')
  @HttpCode(HttpStatus.OK)
  @ApiVerifyNewTarget()
  async verifyNewTarget(@UserId() userId: string, @Body() dto: VerifyNewTargetDto): Promise<SuccessResponseDto> {
    this.logger.log(`POST /account/profile/verify-new-target - userId: ${userId}`);
    return this.profileService.verifyNewTarget(userId, dto.channel as VerificationChannel, dto.otpCode);
  }

  // Resends verification OTP for active verification
  @Post('resend-target-otp')
  @HttpCode(HttpStatus.OK)
  @ApiResendTargetOtp()
  async resendTargetOtp(@UserId() userId: string, @Body() dto: ResendTargetOtpDto): Promise<SuccessResponseDto> {
    this.logger.log(`POST /account/profile/resend-target-otp - userId: ${userId}`);
    return this.profileService.resendTargetOtp(userId, dto.channel as VerificationChannel);
  }
}
