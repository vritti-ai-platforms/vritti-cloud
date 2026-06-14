import { type VerificationChannel, VerificationChannelValues } from '@/db/schema/enums';

export type FrontendVerificationMethod = 'whatsapp' | 'sms' | 'manual';

// Maps frontend method names to internal channel enum values
export function mapToInternalChannel(frontendMethod: FrontendVerificationMethod): VerificationChannel {
  switch (frontendMethod) {
    case 'whatsapp':
      return VerificationChannelValues.WHATSAPP_IN;
    case 'sms':
      return VerificationChannelValues.SMS_IN;
    case 'manual':
      return VerificationChannelValues.SMS_OUT;
  }
}
