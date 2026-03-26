import { VerificationService } from '@domain/verification/services/verification.service';
import { SessionService } from '@domain/session/services/session.service';
import { UserService } from '@domain/user/services/user.service';
import { Injectable, Logger } from '@nestjs/common';
import {
  BadRequestException,
  EmailService,
  NotFoundException,
  normalizePhoneNumber,
  SuccessResponseDto,
} from '@vritti/api-sdk';
import type { VerificationChannel } from '@/db/schema';
import { VerificationChannelValues } from '@/db/schema';
import { SmsService } from '@/services';
import { UserDto } from '../../../cloud-api/user/dto/entity/user.dto';
import { UpdateUserDto } from '../../../cloud-api/user/dto/request/update-user.dto';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    private readonly verificationService: VerificationService,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
  ) {}

  // Returns the authenticated user's profile
  async getProfile(userId: string): Promise<UserDto> {
    return this.userService.findById(userId);
  }

  // Updates the authenticated user's profile information
  async updateProfile(userId: string, dto: UpdateUserDto): Promise<UserDto> {
    return this.userService.update(userId, dto);
  }

  // Deactivates account and invalidates all sessions
  async deleteAccount(userId: string): Promise<SuccessResponseDto> {
    await this.userService.deactivate(userId);
    await this.sessionService.invalidateAllUserSessions(userId);
    return { success: true, message: 'Account successfully deleted.' };
  }

  // Sends OTP to current contact to confirm user identity (step 1)
  async identityVerificationStart(userId: string, channel: VerificationChannel): Promise<{ expiresAt: Date }> {
    const identityChannel = this.getIdentityChannel(channel);
    const user = await this.userService.findById(userId);

    if (this.isEmailChannel(channel)) {
      if (!user.emailVerified) {
        throw new BadRequestException({
          label: 'Email Not Verified',
          detail: 'You must verify your current email address before you can change it.',
        });
      }

      const { otp, expiresAt } = await this.verificationService.createVerification(
        userId,
        identityChannel,
        user.email,
      );

      this.emailService
        .sendVerificationEmail(user.email, otp, expiresAt, user.displayName || undefined)
        .catch((error) => {
          this.logger.error(`Failed to send identity verification email to ${user.email}: ${error.message}`);
        });

      this.logger.log(`Identity verification OTP sent to ${user.email} for user ${userId}`);
      return { expiresAt };
    }

    // Phone channel
    if (!user.phoneVerified) {
      throw new BadRequestException({
        label: 'Phone Not Verified',
        detail: 'You must verify your current phone number before you can change it.',
      });
    }

    if (!user.phone) {
      throw new BadRequestException({
        label: 'Phone Number Not Found',
        detail: 'No phone number is associated with your account.',
      });
    }

    const { otp, expiresAt } = await this.verificationService.createVerification(
      userId,
      identityChannel,
      user.phone,
    );

    this.smsService.sendVerificationSms(`+${user.phone}`, otp, user.displayName ?? undefined).catch((error) => {
      this.logger.error(`Failed to send SMS to ${user.phone}: ${error.message}`);
    });

    this.logger.log(`Identity verification OTP sent to ${user.phone} for user ${userId}`);
    return { expiresAt };
  }

  // Verifies OTP sent to current contact (step 2)
  async verifyIdentity(userId: string, channel: VerificationChannel, otpCode: string): Promise<SuccessResponseDto> {
    const identityChannel = this.getIdentityChannel(channel);
    await this.verificationService.verifyVerification(otpCode, identityChannel, userId);

    const label = this.isEmailChannel(channel) ? 'email' : 'phone';
    this.logger.log(`Identity verified for ${label} change by user ${userId}`);

    return { success: true, message: 'Identity verified successfully.' };
  }

  // Validates new target and sends verification OTP to it (step 3)
  async submitNewTarget(
    userId: string,
    channel: VerificationChannel,
    target: string,
  ): Promise<{ expiresAt: Date }> {
    const targetChannel = this.getTargetChannel(channel);

    // Check identity was verified via either email or phone
    const emailIdentity = await this.verificationService.findByUserIdAndChannel(
      userId,
      VerificationChannelValues.IDENTITY_EMAIL_OUT,
    );
    const phoneIdentity = await this.verificationService.findByUserIdAndChannel(
      userId,
      VerificationChannelValues.IDENTITY_SMS_OUT,
    );

    const isIdentityVerified = emailIdentity?.isVerified || phoneIdentity?.isVerified;

    if (!isIdentityVerified) {
      throw new BadRequestException({
        label: 'Identity Not Verified',
        detail: 'Please verify your identity before submitting a new contact.',
      });
    }

    const user = await this.userService.findById(userId);

    if (this.isEmailChannel(channel)) {
      if (target.toLowerCase() === user.email.toLowerCase()) {
        throw new BadRequestException({
          label: 'Same Email',
          detail: 'Please enter a different email address than your current one.',
        });
      }

      const existingUser = await this.userService.findByEmail(target);
      if (existingUser) {
        throw new BadRequestException({
          label: 'Email Already In Use',
          detail: 'This email address is already associated with another account. Please use a different email.',
        });
      }

      const { otp, expiresAt } = await this.verificationService.createVerification(userId, targetChannel, target);

      this.emailService
        .sendVerificationEmail(target, otp, expiresAt, user.displayName || undefined)
        .catch((error) => {
          this.logger.error(`Failed to send verification email to ${target}: ${error.message}`);
        });

      this.logger.log(`Verification OTP sent to new email ${target} for user ${userId}`);
      return { expiresAt };
    }

    // Phone channel
    const normalizedNewPhone = normalizePhoneNumber(target);
    const normalizedOldPhone = user.phone ? normalizePhoneNumber(user.phone) : '';

    if (normalizedNewPhone === normalizedOldPhone) {
      throw new BadRequestException({
        label: 'Same Phone Number',
        detail: 'Please enter a different phone number than your current one.',
      });
    }

    const phoneInUse = await this.verificationService.isTargetVerifiedByOtherUser(normalizedNewPhone, userId);
    if (phoneInUse) {
      throw new BadRequestException({
        label: 'Phone Already In Use',
        detail: 'This phone number is already associated with another account. Please use a different phone.',
      });
    }

    const { otp, expiresAt } = await this.verificationService.createVerification(
      userId,
      targetChannel,
      normalizedNewPhone,
    );

    this.smsService
      .sendVerificationSms(`+${normalizedNewPhone}`, otp, user.displayName ?? undefined)
      .catch((error) => {
        this.logger.error(`Failed to send SMS to ${normalizedNewPhone}: ${error.message}`);
      });

    this.logger.log(`Verification OTP sent to new phone ${normalizedNewPhone} for user ${userId}`);
    return { expiresAt };
  }

  // Verifies OTP sent to new target and completes the change (step 4)
  async verifyNewTarget(userId: string, channel: VerificationChannel, otpCode: string): Promise<SuccessResponseDto> {
    const targetChannel = this.getTargetChannel(channel);

    await this.verificationService.verifyVerification(otpCode, targetChannel, userId);

    const verification = await this.verificationService.findByUserIdAndChannel(userId, targetChannel);

    if (!verification?.target) {
      throw new BadRequestException({
        label: 'Verification Not Found',
        detail: this.isEmailChannel(channel)
          ? 'No email change verification found. Please start the process again.'
          : 'No phone change verification found. Please start the process again.',
      });
    }

    if (this.isEmailChannel(channel)) {
      await this.userService.update(userId, {
        email: verification.target,
        emailVerified: true,
      });

      this.logger.log(`Email changed successfully for user ${userId} to ${verification.target}`);
      return { success: true, message: 'Email changed successfully.' };
    }

    await this.userService.update(userId, {
      phone: verification.target,
      phoneVerified: true,
    });

    this.logger.log(`Phone changed successfully for user ${userId} to ${verification.target}`);
    return { success: true, message: 'Phone number changed successfully.' };
  }

  // Resends the verification OTP for the active verification
  async resendTargetOtp(userId: string, channel: VerificationChannel): Promise<SuccessResponseDto> {
    const identityChannel = this.getIdentityChannel(channel);
    const targetChannel = this.getTargetChannel(channel);

    // Try the new-target verification first, then fall back to identity verification
    let existing = await this.verificationService.findByUserIdAndChannel(userId, targetChannel);
    let resolvedChannel: VerificationChannel = targetChannel;

    if (!existing || !existing.target) {
      existing = await this.verificationService.findByUserIdAndChannel(userId, identityChannel);
      resolvedChannel = identityChannel;
    }

    if (!existing || !existing.target) {
      throw new NotFoundException('No active verification found. Please start the process again.');
    }

    const { otp, expiresAt } = await this.verificationService.createVerification(
      userId,
      resolvedChannel,
      existing.target,
    );

    const user = await this.userService.findById(userId);

    if (this.isEmailChannel(channel)) {
      this.emailService
        .sendVerificationEmail(existing.target, otp, expiresAt, user.displayName || undefined)
        .catch((error) => {
          this.logger.error(`Failed to resend verification email: ${error.message}`);
        });
    } else {
      this.smsService
        .sendVerificationSms(`+${existing.target}`, otp, user.displayName ?? undefined)
        .catch((error) => {
          this.logger.error(`Failed to resend SMS: ${error.message}`);
        });
    }

    this.logger.log(`Resent OTP for user ${userId}`);
    return { success: true, message: 'Verification code resent successfully.' };
  }

  // Checks whether the channel belongs to an email flow
  private isEmailChannel(channel: VerificationChannel): boolean {
    return channel === VerificationChannelValues.IDENTITY_EMAIL_OUT || channel === VerificationChannelValues.EMAIL;
  }

  // Returns the identity verification channel for the given flow
  private getIdentityChannel(channel: VerificationChannel): VerificationChannel {
    return this.isEmailChannel(channel)
      ? VerificationChannelValues.IDENTITY_EMAIL_OUT
      : VerificationChannelValues.IDENTITY_SMS_OUT;
  }

  // Returns the target verification channel for the given flow
  private getTargetChannel(channel: VerificationChannel): VerificationChannel {
    return this.isEmailChannel(channel) ? VerificationChannelValues.EMAIL : VerificationChannelValues.SMS_OUT;
  }
}
