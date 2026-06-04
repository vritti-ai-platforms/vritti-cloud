import { MediaService } from '@domain/media/services/media.service';
import { SessionService } from '@domain/session/services/session.service';
import { UserService } from '@domain/user/services/user.service';
import { VerificationService } from '@domain/verification/services/verification.service';
import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  BadRequestException,
  EmailService,
  NotFoundException,
  normalizePhoneNumber,
  SuccessResponseDto,
} from '@vritti/api-sdk';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import type { FastifyRequest } from 'fastify';
import type { VerificationChannel } from '@/db/schema';
import { VerificationChannelValues } from '@/db/schema';
import { SmsService } from '@/services';
import {
  AUTH_STATUS_EVENTS,
  ProfileUpdatedEvent,
} from '../../../cloud-api/auth/root/events/auth-status.events';
import { UserDto } from '../../../cloud-api/user/dto/entity/user.dto';
import type { UpdateUserDto } from '../../../cloud-api/user/dto/request/update-user.dto';
import { UpdateProfileDto } from '../dto/request/update-profile.dto';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    private readonly verificationService: VerificationService,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
    private readonly mediaService: MediaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // Returns the authenticated user's profile
  async getProfile(userId: string): Promise<UserDto> {
    const user = await this.userService.findById(userId);
    if (user.mediaId) {
      const presignedUrl = await this.mediaService.getPresignedUrl(user.mediaId);
      user.profilePictureUrl = presignedUrl.url;
    }
    return user;
  }

  // Updates the authenticated user's profile information (supports JSON and multipart)
  async updateProfile(userId: string, request: FastifyRequest): Promise<SuccessResponseDto> {
    const contentType = request.headers['content-type'] ?? '';
    const isMultipart = contentType.includes('multipart/form-data');

    if (!isMultipart) {
      const dto = request.body as UpdateProfileDto;
      await this.userService.update(userId, dto as UpdateUserDto);
      this.eventEmitter.emit(AUTH_STATUS_EVENTS.PROFILE_UPDATED, new ProfileUpdatedEvent(userId));
      return { success: true, message: 'Profile updated successfully.' };
    }

    const { dto, file } = await this.parseProfileUpdateRequest(request);
    const updateData: Record<string, unknown> = {};

    if (dto.fullName !== undefined) updateData.fullName = dto.fullName;
    if (dto.displayName !== undefined) updateData.displayName = dto.displayName;
    if (dto.locale !== undefined) updateData.locale = dto.locale;
    if (dto.timezone !== undefined) updateData.timezone = dto.timezone;

    if (file) {
      const uploadedMedia = await this.mediaService.upload(file, userId, {
        entityType: 'user',
        entityId: userId,
      });
      updateData.mediaId = uploadedMedia.id;
      updateData.profilePictureUrl = uploadedMedia.storageKey;
    }

    await this.userService.update(userId, updateData as UpdateUserDto);
    this.eventEmitter.emit(AUTH_STATUS_EVENTS.PROFILE_UPDATED, new ProfileUpdatedEvent(userId));
    return { success: true, message: 'Profile updated successfully.' };
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

      const { otp, expiresAt } = await this.verificationService.createVerification(userId, identityChannel, user.email);

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

    const { otp, expiresAt } = await this.verificationService.createVerification(userId, identityChannel, user.phone);

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
  async submitNewTarget(userId: string, channel: VerificationChannel, target: string): Promise<{ expiresAt: Date }> {
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

      this.emailService.sendVerificationEmail(target, otp, expiresAt, user.displayName || undefined).catch((error) => {
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

    this.smsService.sendVerificationSms(`+${normalizedNewPhone}`, otp, user.displayName ?? undefined).catch((error) => {
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
      this.smsService.sendVerificationSms(`+${existing.target}`, otp, user.displayName ?? undefined).catch((error) => {
        this.logger.error(`Failed to resend SMS: ${error.message}`);
      });
    }

    this.logger.log(`Resent OTP for user ${userId}`);
    return { success: true, message: 'Verification code resent successfully.' };
  }

  // Parses multipart form data into UpdateProfileDto fields and optional file
  private async parseProfileUpdateRequest(request: FastifyRequest): Promise<{
    dto: UpdateProfileDto;
    file?: { buffer: Buffer; filename: string; mimetype: string };
  }> {
    const parts = request.parts();
    const fields: Record<string, unknown> = {};
    let file: { buffer: Buffer; filename: string; mimetype: string } | undefined;

    for await (const part of parts) {
      if (part.type === 'file') {
        const buffer = await part.toBuffer();
        file = { buffer, filename: part.filename, mimetype: part.mimetype };
      } else {
        fields[part.fieldname] = part.value;
      }
    }

    const dto = await this.validateProfileDto(fields);
    return { dto, file };
  }

  // Validates raw fields against UpdateProfileDto using class-validator
  private async validateProfileDto(fields: Record<string, unknown>): Promise<UpdateProfileDto> {
    const dto = plainToInstance(UpdateProfileDto, fields);
    const errors = await validate(dto);

    if (errors.length > 0) {
      const fieldErrors = errors.map((e) => ({
        field: e.property,
        message: Object.values(e.constraints ?? {})[0] ?? 'Invalid value',
      }));
      throw new BadRequestException({
        label: 'Validation Failed',
        detail: 'One or more fields are invalid.',
        errors: fieldErrors,
      });
    }

    return dto;
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
