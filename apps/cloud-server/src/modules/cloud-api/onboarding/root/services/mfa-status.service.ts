import { Injectable, Logger } from '@nestjs/common';
import { AccountStatusValues, OnboardingStepValues } from '@/db/schema';
import { MfaRepository } from '@domain/mfa/repositories/mfa.repository';
import { UserService } from '@domain/user/services/user.service';
import { MfaStatusResponseDto } from '../../../../account/security/dto/response/mfa-status-response.dto';

@Injectable()
export class MfaStatusService {
  private readonly logger = new Logger(MfaStatusService.name);

  constructor(
    private readonly mfaRepo: MfaRepository,
    private readonly userService: UserService,
  ) {}

  // Clears any pending setup and marks onboarding as complete without enabling MFA
  async skipMfaSetup(userId: string): Promise<{ success: boolean; message: string }> {
    await this.userService.update(userId, {
      onboardingStep: OnboardingStepValues.COMPLETE,
      accountStatus: AccountStatusValues.ACTIVE,
    });

    this.logger.log(`User ${userId} skipped MFA setup`);

    return {
      success: true,
      message: 'Multi-factor authentication setup skipped. You can enable it later in settings.',
    };
  }

  // Retrieves all active MFA records and returns aggregated status
  async getMfaStatus(userId: string): Promise<MfaStatusResponseDto> {
    const mfaRecords = await this.mfaRepo.findAllActiveByUserId(userId);

    if (mfaRecords.length === 0) {
      return new MfaStatusResponseDto({
        isEnabled: false,
        methods: [],
        backupCodesRemaining: 0,
        lastUsedAt: null,
        createdAt: null,
      });
    }

    const methods = [...new Set(mfaRecords.map((r) => r.method))];
    const first = mfaRecords[0];

    let backupCodesRemaining = 0;
    if (first.totpBackupCodes) {
      try {
        backupCodesRemaining = (JSON.parse(first.totpBackupCodes) as string[]).length;
      } catch {
        this.logger.warn(`Failed to parse backup codes for MFA ${first.id}`);
      }
    }

    return new MfaStatusResponseDto({
      isEnabled: true,
      methods,
      backupCodesRemaining,
      lastUsedAt: first.lastUsedAt,
      createdAt: first.createdAt,
    });
  }
}
