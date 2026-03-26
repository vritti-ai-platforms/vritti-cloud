import { VerificationService } from '@domain/verification/services/verification.service';
import { Injectable, Logger } from '@nestjs/common';
import { BadRequestException, NotFoundException, normalizePhoneNumber, SuccessResponseDto } from '@vritti/api-sdk';
import type { VerificationChannel } from '@/db/schema';
import { VerificationChannelValues } from '@/db/schema';
import { SmsService } from '@/services';
import { UserService } from './user.service';

@Injectable()
export class PhoneChangeService {
  private readonly logger = new Logger(PhoneChangeService.name);

  constructor(
    private readonly verificationService: VerificationService,
    private readonly smsService: SmsService,
    private readonly userService: UserService,
  ) {}

  // Sends OTP to current phone to confirm user identity (step 1)
  async requestIdentityVerification(userId: string): Promise<{ expiresAt: Date }> {
    const user = await this.userService.findById(userId);

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
      VerificationChannelValues.IDENTITY_SMS_OUT,
      user.phone,
    );

    // Send OTP to current phone (fire and forget)
    this.smsService.sendVerificationSms(`+${user.phone}`, otp, user.displayName ?? undefined).catch((error) => {
      this.logger.error(`Failed to send SMS to ${user.phone}: ${error.message}`);
    });

    this.logger.log(`Identity verification OTP sent to ${user.phone} for user ${userId}`);

    return { expiresAt };
  }

  // Verifies OTP sent to current phone (step 2)
  async verifyIdentity(userId: string, otpCode: string): Promise<SuccessResponseDto> {
    await this.verificationService.verifyVerification(otpCode, VerificationChannelValues.IDENTITY_SMS_OUT, userId);

    this.logger.log(`Identity verified for phone change by user ${userId}`);

    return { success: true, message: 'Identity verified successfully.' };
  }

  // Validates new phone and sends verification OTP to it (step 3)
  async submitNewPhone(userId: string, newPhone: string): Promise<{ expiresAt: Date }> {
    // Check identity was verified
    const identityVerification = await this.verificationService.findByUserIdAndChannel(
      userId,
      VerificationChannelValues.IDENTITY_SMS_OUT,
    );

    if (!identityVerification || !identityVerification.isVerified) {
      throw new BadRequestException({
        label: 'Identity Not Verified',
        detail: 'Please verify your identity before submitting a new phone number.',
      });
    }

    const user = await this.userService.findById(userId);

    // Normalize phone numbers for comparison
    const normalizedNewPhone = normalizePhoneNumber(newPhone);
    const normalizedOldPhone = user.phone ? normalizePhoneNumber(user.phone) : '';

    if (normalizedNewPhone === normalizedOldPhone) {
      throw new BadRequestException({
        label: 'Same Phone Number',
        detail: 'Please enter a different phone number than your current one.',
      });
    }

    // Check if new phone is already in use by another user
    const phoneInUse = await this.verificationService.isTargetVerifiedByOtherUser(normalizedNewPhone, userId);
    if (phoneInUse) {
      throw new BadRequestException({
        label: 'Phone Already In Use',
        detail: 'This phone number is already associated with another account. Please use a different phone.',
      });
    }

    const { otp, expiresAt } = await this.verificationService.createVerification(
      userId,
      VerificationChannelValues.SMS_OUT,
      normalizedNewPhone,
    );

    // Send OTP to new phone (fire and forget)
    this.smsService.sendVerificationSms(`+${normalizedNewPhone}`, otp, user.displayName ?? undefined).catch((error) => {
      this.logger.error(`Failed to send SMS to ${normalizedNewPhone}: ${error.message}`);
    });

    this.logger.log(`Verification OTP sent to new phone ${normalizedNewPhone} for user ${userId}`);

    return { expiresAt };
  }

  // Verifies OTP sent to new phone and completes the change (step 4)
  async verifyNewPhone(userId: string, otpCode: string): Promise<SuccessResponseDto> {
    // Verify the OTP for the new phone
    await this.verificationService.verifyVerification(otpCode, VerificationChannelValues.SMS_OUT, userId);

    // Get the new phone from the verification target
    const verification = await this.verificationService.findByUserIdAndChannel(
      userId,
      VerificationChannelValues.SMS_OUT,
    );

    if (!verification?.target) {
      throw new BadRequestException({
        label: 'Verification Not Found',
        detail: 'No phone change verification found. Please start the process again.',
      });
    }

    const newPhone = verification.target;

    // Update user's phone
    await this.userService.update(userId, {
      phone: newPhone,
      phoneVerified: true,
    });

    this.logger.log(`Phone changed successfully for user ${userId} to ${newPhone}`);

    return { success: true, message: 'Phone number changed successfully.' };
  }

  // Resends the verification OTP by looking up the active verification and creating a new one
  async resendOtp(userId: string): Promise<SuccessResponseDto> {
    // Try the new-phone verification first, then fall back to identity verification
    let existing = await this.verificationService.findByUserIdAndChannel(userId, VerificationChannelValues.SMS_OUT);
    let channel: VerificationChannel = VerificationChannelValues.SMS_OUT;

    if (!existing || !existing.target) {
      existing = await this.verificationService.findByUserIdAndChannel(
        userId,
        VerificationChannelValues.IDENTITY_SMS_OUT,
      );
      channel = VerificationChannelValues.IDENTITY_SMS_OUT;
    }

    if (!existing || !existing.target) {
      throw new NotFoundException('No active verification found. Please start the process again.');
    }

    const { otp } = await this.verificationService.createVerification(userId, channel, existing.target);

    const user = await this.userService.findById(userId);
    this.smsService.sendVerificationSms(`+${existing.target}`, otp, user.displayName ?? undefined).catch((error) => {
      this.logger.error(`Failed to resend SMS: ${error.message}`);
    });

    this.logger.log(`Resent OTP for user ${userId}`);
    return { success: true, message: 'Verification code resent successfully.' };
  }
}
