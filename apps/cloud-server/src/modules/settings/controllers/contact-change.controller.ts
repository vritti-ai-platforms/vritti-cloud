import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession, UserId } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import { EmailChangeService } from '@domain/user/services/email-change.service';
import { PhoneChangeService } from '@domain/user/services/phone-change.service';
import {
  ApiRequestEmailIdentityVerification,
  ApiVerifyEmailIdentity,
  ApiSubmitNewEmail,
  ApiVerifyNewEmail,
  ApiResendEmailOtp,
  ApiRequestPhoneIdentityVerification,
  ApiVerifyPhoneIdentity,
  ApiSubmitNewPhone,
  ApiVerifyNewPhone,
  ApiResendPhoneOtp,
} from '../docs/contact-change.docs';
import {
  SubmitNewEmailDto,
  SubmitNewPhoneDto,
  VerifyIdentityDto,
  VerifyNewEmailDto,
  VerifyNewPhoneDto,
} from '../dto/request/contact-change.dto';

@ApiTags('Settings - Contact Change')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.CLOUD, SessionTypeValues.ADMIN)
@Controller('settings/contact')
export class ContactChangeController {
  constructor(
    private readonly emailChangeService: EmailChangeService,
    private readonly phoneChangeService: PhoneChangeService,
  ) {}

  // ============================================================================
  // Email Change Endpoints
  // ============================================================================

  // Sends an OTP to the user's current email to confirm identity
  @Post('email/request-identity-verification')
  @HttpCode(HttpStatus.OK)
  @ApiRequestEmailIdentityVerification()
  async requestEmailIdentityVerification(@UserId() userId: string) {
    return this.emailChangeService.requestIdentityVerification(userId);
  }

  // Verifies the identity OTP and creates an email change request
  @Post('email/verify-identity')
  @HttpCode(HttpStatus.OK)
  @ApiVerifyEmailIdentity()
  async verifyEmailIdentity(@UserId() userId: string, @Body() dto: VerifyIdentityDto) {
    return this.emailChangeService.verifyIdentity(userId, dto.otpCode);
  }

  // Validates the new email and sends a verification OTP to it
  @Post('email/submit-new-email')
  @HttpCode(HttpStatus.OK)
  @ApiSubmitNewEmail()
  async submitNewEmail(@UserId() userId: string, @Body() dto: SubmitNewEmailDto) {
    return this.emailChangeService.submitNewEmail(userId, dto.newEmail);
  }

  // Verifies the new email OTP and completes the email change
  @Post('email/verify-new-email')
  @HttpCode(HttpStatus.OK)
  @ApiVerifyNewEmail()
  async verifyNewEmail(@UserId() userId: string, @Body() dto: VerifyNewEmailDto) {
    return this.emailChangeService.verifyNewEmail(userId, dto.otpCode);
  }

  // Resends the email verification OTP for the active verification
  @Post('email/resend-otp')
  @HttpCode(HttpStatus.OK)
  @ApiResendEmailOtp()
  async resendEmailOtp(@UserId() userId: string) {
    return this.emailChangeService.resendOtp(userId);
  }

  // ============================================================================
  // Phone Change Endpoints
  // ============================================================================

  // Sends an OTP to the user's current phone to confirm identity
  @Post('phone/request-identity-verification')
  @HttpCode(HttpStatus.OK)
  @ApiRequestPhoneIdentityVerification()
  async requestPhoneIdentityVerification(@UserId() userId: string) {
    return this.phoneChangeService.requestIdentityVerification(userId);
  }

  // Verifies the identity OTP and creates a phone change request
  @Post('phone/verify-identity')
  @HttpCode(HttpStatus.OK)
  @ApiVerifyPhoneIdentity()
  async verifyPhoneIdentity(@UserId() userId: string, @Body() dto: VerifyIdentityDto) {
    return this.phoneChangeService.verifyIdentity(userId, dto.otpCode);
  }

  // Validates the new phone number and sends a verification OTP to it
  @Post('phone/submit-new-phone')
  @HttpCode(HttpStatus.OK)
  @ApiSubmitNewPhone()
  async submitNewPhone(@UserId() userId: string, @Body() dto: SubmitNewPhoneDto) {
    return this.phoneChangeService.submitNewPhone(userId, dto.newPhone);
  }

  // Verifies the new phone OTP and completes the phone change
  @Post('phone/verify-new-phone')
  @HttpCode(HttpStatus.OK)
  @ApiVerifyNewPhone()
  async verifyNewPhone(@UserId() userId: string, @Body() dto: VerifyNewPhoneDto) {
    return this.phoneChangeService.verifyNewPhone(userId, dto.otpCode);
  }

  // Resends the phone verification OTP for the active verification
  @Post('phone/resend-otp')
  @HttpCode(HttpStatus.OK)
  @ApiResendPhoneOtp()
  async resendPhoneOtp(@UserId() userId: string) {
    return this.phoneChangeService.resendOtp(userId);
  }
}
