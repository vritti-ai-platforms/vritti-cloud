import { axios } from '@vritti/quantum-ui/axios';

export enum OnboardingStep {
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  PHONE_VERIFICATION = 'PHONE_VERIFICATION',
  SET_PASSWORD = 'SET_PASSWORD',
  MFA_SETUP = 'MFA_SETUP',
  COMPLETED = 'COMPLETED',
}

export type SignupMethod = 'email' | 'oauth';

export type MFAMethod = 'totp' | 'sms' | 'passkey';

export interface MFAChallenge {
  sessionId: string;
  availableMethods: MFAMethod[];
  defaultMethod: MFAMethod;
  maskedPhone?: string;
}

export interface SignupDto {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface SignupResponse {
  accessToken: string;
  expiresIn: number;
  isNewUser: boolean;
  signupMethod: SignupMethod;
  currentStep: OnboardingStep;
}

export interface LoginResponse {
  accessToken?: string;
  expiresIn?: number;
  requiresMfa?: boolean;
  mfaChallenge?: MFAChallenge;
  requiresOnboarding?: boolean;
  user?: {
    id: string;
    email: string;
    fullName: string;
    displayName: string;
  };
}

// Registers a new user account
export function signup(data: SignupDto): Promise<SignupResponse> {
  return axios
    .post<SignupResponse>('cloud-api/auth/signup', data, {
      public: true,
      showSuccessToast: false,
    })
    .then((r) => r.data);
}

// Authenticates a user with email and password
export function login(data: LoginDto): Promise<LoginResponse> {
  return axios
    .post<LoginResponse>('cloud-api/auth/login', data, {
      public: true,
      showSuccessToast: false,
    })
    .then((r) => r.data);
}

// Verifies TOTP code for MFA authentication
export function verifyTotp(sessionId: string, code: string): Promise<LoginResponse> {
  return axios
    .post<LoginResponse>(
      'cloud-api/auth/mfa/verify-totp',
      { sessionId, code },
      {
        public: true,
        showSuccessToast: false,
      },
    )
    .then((r) => r.data);
}

// Sends SMS verification code for MFA authentication
export function sendSmsCode(sessionId: string): Promise<void> {
  return axios
    .post(
      'cloud-api/auth/mfa/sms/send',
      { sessionId },
      {
        public: true,
        loadingMessage: 'Sending code...',
        successMessage: 'Code sent! Check your phone.',
      },
    )
    .then(() => undefined);
}

// Verifies SMS code for MFA authentication
export function verifySms(sessionId: string, code: string): Promise<LoginResponse> {
  return axios
    .post<LoginResponse>(
      'cloud-api/auth/mfa/sms/verify',
      { sessionId, code },
      {
        public: true,
        showSuccessToast: false,
      },
    )
    .then((r) => r.data);
}

// Starts passkey verification for MFA authentication
export function startPasskeyVerification(sessionId: string): Promise<PasskeyAuthOptionsResponse> {
  return axios
    .post<PasskeyAuthOptionsResponse>('cloud-api/auth/mfa/passkey/start', { sessionId }, { public: true })
    .then((r) => r.data);
}

// Verifies passkey for MFA authentication
export function verifyPasskeyMfa(sessionId: string, credential: AuthenticationResponseJSON): Promise<LoginResponse> {
  return axios
    .post<LoginResponse>(
      'cloud-api/auth/mfa/passkey/verify',
      { sessionId, credential },
      {
        public: true,
        showSuccessToast: false,
      },
    )
    .then((r) => r.data);
}

export interface PublicKeyCredentialRequestOptions {
  challenge: string;
  timeout?: number;
  rpId?: string;
  allowCredentials?: Array<{
    id: string;
    type: 'public-key';
    transports?: string[];
  }>;
  userVerification?: 'discouraged' | 'preferred' | 'required';
}

export interface PasskeyAuthOptionsResponse {
  options: PublicKeyCredentialRequestOptions;
  sessionId: string;
}

export interface AuthenticationResponseJSON {
  id: string;
  rawId: string;
  response: {
    clientDataJSON: string;
    authenticatorData: string;
    signature: string;
    userHandle?: string;
  };
  authenticatorAttachment?: 'platform' | 'cross-platform';
  clientExtensionResults: Record<string, unknown>;
  type: 'public-key';
}

// Starts passkey authentication flow
export function startPasskeyLogin(email?: string): Promise<PasskeyAuthOptionsResponse> {
  return axios
    .post<PasskeyAuthOptionsResponse>('cloud-api/auth/passkey/start', { email }, { public: true })
    .then((r) => r.data);
}

// Verifies passkey authentication and logs in the user
export function verifyPasskeyLogin(sessionId: string, credential: AuthenticationResponseJSON): Promise<LoginResponse> {
  return axios
    .post<LoginResponse>('cloud-api/auth/passkey/verify', { sessionId, credential }, { public: true })
    .then((r) => r.data);
}

export interface SuccessResponse {
  success: boolean;
  message: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  accessToken?: string;
  expiresIn?: number;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
  accessToken: string;
  expiresIn: number;
  sessionType: 'CLOUD' | 'ONBOARDING';
}

// Sends password reset OTP and creates a RESET session
export function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
  return axios
    .post<ForgotPasswordResponse>(
      'cloud-api/auth/forgot-password',
      { email },
      {
        public: true,
        showSuccessToast: false,
      },
    )
    .then((r) => r.data);
}

// Resends OTP using the RESET session Bearer token
export function resendResetOtp(): Promise<SuccessResponse> {
  return axios
    .post<SuccessResponse>(
      'cloud-api/auth/resend-reset-otp',
      {},
      {
        showSuccessToast: false,
      },
    )
    .then((r) => r.data);
}

// Verifies OTP using the RESET session Bearer token
export function verifyResetOtp(otp: string): Promise<SuccessResponse> {
  return axios
    .post<SuccessResponse>(
      'cloud-api/auth/verify-reset-otp',
      { otp },
      {
        showSuccessToast: false,
      },
    )
    .then((r) => r.data);
}

// Resets password and creates a new CLOUD or ONBOARDING session
export function resetPassword(newPassword: string): Promise<ResetPasswordResponse> {
  return axios
    .post<ResetPasswordResponse>(
      'cloud-api/auth/reset-password',
      { newPassword },
      {
        showSuccessToast: false,
      },
    )
    .then((r) => r.data);
}
