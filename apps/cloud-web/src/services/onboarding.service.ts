import { axios } from '@vritti/quantum-ui/axios';

export interface OnboardingStatusResponse {
  email: string;
  currentStep: string;
  onboardingComplete: boolean;
  signupMethod: 'email' | 'oauth';
}

export interface VerifyEmailDto {
  otp: string;
}

// Verifies user's email address using OTP code
export function verifyEmail(otp: string): Promise<OnboardingStatusResponse> {
  return axios
    .post<OnboardingStatusResponse>(
      'cloud-api/onboarding/email-verification/verify-otp',
      { otp },
      {
        showSuccessToast: false,
      },
    )
    .then((r) => r.data);
}

// Retrieves current onboarding status for the authenticated user
export function getStatus(): Promise<OnboardingStatusResponse> {
  return axios.get<OnboardingStatusResponse>('cloud-api/onboarding/status').then((r) => r.data);
}

export interface SendEmailOtpResponse {
  success: boolean;
  message: string;
}

// Sends initial email verification OTP for email signup users
export function sendEmailOtp(): Promise<SendEmailOtpResponse> {
  return axios.post<SendEmailOtpResponse>('cloud-api/onboarding/email-verification/send-otp').then((r) => r.data);
}

// Changes the user's email during onboarding and sends a new OTP
export function changeEmail(email: string): Promise<SendEmailOtpResponse> {
  return axios
    .post<SendEmailOtpResponse>('cloud-api/onboarding/email-verification/change-email', { email })
    .then((r) => r.data);
}

export interface SetPasswordResponse {
  success: boolean;
  message: string;
}

// Sets password for OAuth users during onboarding
export function setPassword(password: string): Promise<SetPasswordResponse> {
  return axios.post<SetPasswordResponse>('cloud-api/onboarding/set-password', { password }).then((r) => r.data);
}

// ============================================================================
// MFA (Multi-Factor Authentication) API Functions
// ============================================================================

export interface TotpSetupResponse {
  keyUri: string;
  manualSetupKey: string;
  issuer: string;
  accountName: string;
}

export interface BackupCodesResponse {
  success: boolean;
  message: string;
  backupCodes: string[];
  warning: string;
}

export interface TwoFactorStatusResponse {
  isEnabled: boolean;
  method: string | null;
  backupCodesRemaining: number;
  lastUsedAt: string | null;
  createdAt: string | null;
}

// Initiates TOTP setup and returns QR code for authenticator apps
export function initiateTotpSetup(): Promise<TotpSetupResponse> {
  return axios.post<TotpSetupResponse>('cloud-api/onboarding/mfa/totp/setup').then((r) => r.data);
}

// Verifies TOTP setup with a 6-digit code and returns backup codes
export function verifyTotpSetup(code: string): Promise<BackupCodesResponse> {
  return axios.post<BackupCodesResponse>('cloud-api/onboarding/mfa/totp/verify', { code }).then((r) => r.data);
}

// Skips MFA setup and completes onboarding without MFA
export function skipMFASetup(): Promise<{ success: boolean; message: string }> {
  return axios.post<{ success: boolean; message: string }>('cloud-api/onboarding/mfa/skip').then((r) => r.data);
}

// Gets current MFA status for the authenticated user
export function getMFAStatus(): Promise<TwoFactorStatusResponse> {
  return axios.get<TwoFactorStatusResponse>('cloud-api/onboarding/mfa/status').then((r) => r.data);
}

// ============================================================================
// Passkey (WebAuthn) MFA API Functions
// ============================================================================

export interface PasskeyRegistrationOptionsResponse {
  options: PublicKeyCredentialCreationOptions;
}

export interface PublicKeyCredentialCreationOptions {
  rp: { name: string; id?: string };
  user: { id: string; name: string; displayName: string };
  challenge: string;
  pubKeyCredParams: Array<{ alg: number; type: 'public-key' }>;
  timeout?: number;
  excludeCredentials?: Array<{
    id: string;
    type: 'public-key';
    transports?: string[];
  }>;
  authenticatorSelection?: {
    authenticatorAttachment?: 'platform' | 'cross-platform';
    residentKey?: 'discouraged' | 'preferred' | 'required';
    requireResidentKey?: boolean;
    userVerification?: 'discouraged' | 'preferred' | 'required';
  };
  attestation?: 'none' | 'indirect' | 'direct' | 'enterprise';
}

export interface RegistrationResponseJSON {
  id: string;
  rawId: string;
  response: {
    clientDataJSON: string;
    attestationObject: string;
    transports?: string[];
  };
  authenticatorAttachment?: 'platform' | 'cross-platform';
  clientExtensionResults: Record<string, unknown>;
  type: 'public-key';
}

// Initiates Passkey setup and returns WebAuthn registration options
export function initiatePasskeySetup(): Promise<PasskeyRegistrationOptionsResponse> {
  return axios.post<PasskeyRegistrationOptionsResponse>('cloud-api/onboarding/mfa/passkey/setup').then((r) => r.data);
}

// Verifies Passkey setup with browser credential and returns backup codes
export function verifyPasskeySetup(credential: RegistrationResponseJSON): Promise<BackupCodesResponse> {
  return axios.post<BackupCodesResponse>('cloud-api/onboarding/mfa/passkey/verify', { credential }).then((r) => r.data);
}

// ============================================================================
// Mobile Verification
// ============================================================================

export type VerificationMethod = 'whatsapp' | 'sms' | 'manual';

export interface InitiateMobileVerificationDto {
  phone: string;
  phoneCountry: string;
  method: VerificationMethod;
}

export interface MobileVerificationStatusResponse {
  verificationId: string;
  method: VerificationMethod;
  verificationToken?: string;
  isVerified: boolean;
  phone?: string | null;
  phoneCountry?: string | null;
  expiresAt: string;
  message: string;
  instructions?: string;
  whatsappNumber?: string;
}

// Initiates manual SMS mobile verification for the authenticated user
export function initiateMobileVerification(
  data: InitiateMobileVerificationDto,
): Promise<MobileVerificationStatusResponse> {
  return axios
    .post<MobileVerificationStatusResponse>('cloud-api/onboarding/mobile-verification/initiate/manual', data)
    .then((r) => r.data);
}

// Verifies mobile number using OTP entered by user
export function verifyMobileOtp(otp: string): Promise<{ success: boolean; message: string }> {
  return axios
    .post<{ success: boolean; message: string }>('cloud-api/onboarding/mobile-verification/verify-otp', { otp })
    .then((r) => r.data);
}

export interface CompleteOnboardingResponse {
  accessToken: string;
  expiresIn: number;
}

// Upgrades session to CLOUD and rotates tokens — called on "Go to Dashboard"
export function completeOnboarding(): Promise<CompleteOnboardingResponse> {
  return axios.post<CompleteOnboardingResponse>('cloud-api/onboarding/complete').then((r) => r.data);
}
