import { VerificationService } from '@domain/verification/services/verification.service';
import { Injectable, Logger } from '@nestjs/common';
import { BadRequestException, EmailService, NotFoundException, SuccessResponseDto } from '@vritti/api-sdk';
import type { VerificationChannel } from '@/db/schema';
import { VerificationChannelValues } from '@/db/schema';
import { UserService } from './user.service';

@Injectable()
export class EmailChangeService {
  private readonly logger = new Logger(EmailChangeService.name);

  constructor(
    private readonly verificationService: VerificationService,
    private readonly emailService: EmailService,
    private readonly userService: UserService,
  ) {}

  // Sends OTP to current email to confirm user identity (step 1)
  async requestIdentityVerification(userId: string): Promise<{ expiresAt: Date }> {
    const user = await this.userService.findById(userId);

    if (!user.emailVerified) {
      throw new BadRequestException({
        label: 'Email Not Verified',
        detail: 'You must verify your current email address before you can change it.',
      });
    }

    const { otp, expiresAt } = await this.verificationService.createVerification(
      userId,
      VerificationChannelValues.IDENTITY_EMAIL_OUT,
      user.email,
    );

    // Send OTP email (fire and forget)
    this.emailService
      .sendVerificationEmail(user.email, otp, expiresAt, user.displayName || undefined)
      .catch((error) => {
        this.logger.error(`Failed to send identity verification email to ${user.email}: ${error.message}`);
      });

    this.logger.log(`Identity verification OTP sent to ${user.email} for user ${userId}`);

    return { expiresAt };
  }

  // Verifies OTP sent to current email (step 2)
  async verifyIdentity(userId: string, otpCode: string): Promise<SuccessResponseDto> {
    await this.verificationService.verifyVerification(otpCode, VerificationChannelValues.IDENTITY_EMAIL_OUT, userId);

    this.logger.log(`Identity verified for email change by user ${userId}`);

    return { success: true, message: 'Identity verified successfully.' };
  }

  // Validates new email and sends verification OTP to it (step 3)
  async submitNewEmail(userId: string, newEmail: string): Promise<{ expiresAt: Date }> {
    // Check identity was verified
    const identityVerification = await this.verificationService.findByUserIdAndChannel(
      userId,
      VerificationChannelValues.IDENTITY_EMAIL_OUT,
    );

    if (!identityVerification || !identityVerification.isVerified) {
      throw new BadRequestException({
        label: 'Identity Not Verified',
        detail: 'Please verify your identity before submitting a new email address.',
      });
    }

    const user = await this.userService.findById(userId);

    if (newEmail.toLowerCase() === user.email.toLowerCase()) {
      throw new BadRequestException({
        label: 'Same Email',
        detail: 'Please enter a different email address than your current one.',
      });
    }

    const existingUser = await this.userService.findByEmail(newEmail);
    if (existingUser) {
      throw new BadRequestException({
        label: 'Email Already In Use',
        detail: 'This email address is already associated with another account. Please use a different email.',
      });
    }

    const { otp, expiresAt } = await this.verificationService.createVerification(
      userId,
      VerificationChannelValues.EMAIL,
      newEmail,
    );

    // Send OTP to new email (fire and forget)
    this.emailService.sendVerificationEmail(newEmail, otp, expiresAt, user.displayName || undefined).catch((error) => {
      this.logger.error(`Failed to send verification email to ${newEmail}: ${error.message}`);
    });

    this.logger.log(`Verification OTP sent to new email ${newEmail} for user ${userId}`);

    return { expiresAt };
  }

  // Verifies OTP sent to new email and completes the change (step 4)
  async verifyNewEmail(userId: string, otpCode: string): Promise<SuccessResponseDto> {
    // Verify the OTP for the new email
    await this.verificationService.verifyVerification(otpCode, VerificationChannelValues.EMAIL, userId);

    // Get the new email from the verification target
    const verification = await this.verificationService.findByUserIdAndChannel(userId, VerificationChannelValues.EMAIL);

    if (!verification?.target) {
      throw new BadRequestException({
        label: 'Verification Not Found',
        detail: 'No email change verification found. Please start the process again.',
      });
    }

    const newEmail = verification.target;

    // Update user's email
    await this.userService.update(userId, {
      email: newEmail,
      emailVerified: true,
    });

    this.logger.log(`Email changed successfully for user ${userId} to ${newEmail}`);

    return { success: true, message: 'Email changed successfully.' };
  }

  // Resends the verification OTP by looking up the active verification and creating a new one
  async resendOtp(userId: string): Promise<SuccessResponseDto> {
    // Try the new-email verification first, then fall back to identity verification
    let existing = await this.verificationService.findByUserIdAndChannel(userId, VerificationChannelValues.EMAIL);
    let channel: VerificationChannel = VerificationChannelValues.EMAIL;

    if (!existing || !existing.target) {
      existing = await this.verificationService.findByUserIdAndChannel(
        userId,
        VerificationChannelValues.IDENTITY_EMAIL_OUT,
      );
      channel = VerificationChannelValues.IDENTITY_EMAIL_OUT;
    }

    if (!existing || !existing.target) {
      throw new NotFoundException('No active verification found. Please start the process again.');
    }

    const { otp, expiresAt } = await this.verificationService.createVerification(userId, channel, existing.target);

    const user = await this.userService.findById(userId);
    this.emailService
      .sendVerificationEmail(existing.target, otp, expiresAt, user.displayName || undefined)
      .catch((error) => {
        this.logger.error(`Failed to resend verification email: ${error.message}`);
      });

    this.logger.log(`Resent OTP for user ${userId}`);
    return { success: true, message: 'Verification code resent successfully.' };
  }
}
