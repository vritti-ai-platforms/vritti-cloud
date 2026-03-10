import { axios } from '@vritti/quantum-ui/axios';

export interface IdentityVerificationResponse {
  verificationId: string;
  expiresAt: string;
  maskedEmail?: string;
  maskedPhone?: string;
}

export interface VerifyIdentityRequest {
  verificationId: string;
  otpCode: string;
}

export interface VerifyIdentityResponse {
  changeRequestId: string;
  changeRequestsToday: number;
}

export interface RequestChangeRequest {
  changeRequestId: string;
  newEmail?: string;
  newPhone?: string;
  phoneCountry?: string;
}

export interface RequestChangeResponse {
  verificationId: string;
  expiresAt: string;
}

export interface VerifyChangeRequest {
  changeRequestId: string;
  verificationId: string;
  otpCode: string;
}

export interface VerifyChangeResponse {
  success: boolean;
  revertToken: string;
  revertExpiresAt: string;
  newEmail?: string;
  newPhone?: string;
}

export interface ResendOtpRequest {
  verificationId: string;
}

export interface ResendOtpResponse {
  success: boolean;
  expiresAt: string;
}

export interface RevertChangeRequest {
  revertToken: string;
}

export interface RevertChangeResponse {
  success: boolean;
  revertedEmail?: string;
  revertedPhone?: string;
}

export const verificationService = {
  // Email Flow
  requestEmailIdentityVerification: (): Promise<IdentityVerificationResponse> =>
    axios
      .post<IdentityVerificationResponse>('/cloud-api/users/contact/email/request-identity-verification')
      .then((r) => r.data),

  verifyEmailIdentity: (data: VerifyIdentityRequest): Promise<VerifyIdentityResponse> =>
    axios.post<VerifyIdentityResponse>('/cloud-api/users/contact/email/verify-identity', data).then((r) => r.data),

  requestEmailChange: (data: RequestChangeRequest): Promise<RequestChangeResponse> =>
    axios.post<RequestChangeResponse>('/cloud-api/users/contact/email/submit-new-email', data).then((r) => r.data),

  verifyEmailChange: (data: VerifyChangeRequest): Promise<VerifyChangeResponse> =>
    axios.post<VerifyChangeResponse>('/cloud-api/users/contact/email/verify-new-email', data).then((r) => r.data),

  resendEmailOtp: (data: ResendOtpRequest): Promise<ResendOtpResponse> =>
    axios.post<ResendOtpResponse>('/cloud-api/users/contact/email/resend-otp', data).then((r) => r.data),

  revertEmailChange: (data: RevertChangeRequest): Promise<RevertChangeResponse> =>
    axios.post<RevertChangeResponse>('/cloud-api/users/contact/email/revert', data).then((r) => r.data),

  // Phone Flow
  requestPhoneIdentityVerification: (): Promise<IdentityVerificationResponse> =>
    axios
      .post<IdentityVerificationResponse>('/cloud-api/users/contact/phone/request-identity-verification')
      .then((r) => r.data),

  verifyPhoneIdentity: (data: VerifyIdentityRequest): Promise<VerifyIdentityResponse> =>
    axios.post<VerifyIdentityResponse>('/cloud-api/users/contact/phone/verify-identity', data).then((r) => r.data),

  requestPhoneChange: (data: RequestChangeRequest): Promise<RequestChangeResponse> =>
    axios.post<RequestChangeResponse>('/cloud-api/users/contact/phone/submit-new-phone', data).then((r) => r.data),

  verifyPhoneChange: (data: VerifyChangeRequest): Promise<VerifyChangeResponse> =>
    axios.post<VerifyChangeResponse>('/cloud-api/users/contact/phone/verify-new-phone', data).then((r) => r.data),

  resendPhoneOtp: (data: ResendOtpRequest): Promise<ResendOtpResponse> =>
    axios.post<ResendOtpResponse>('/cloud-api/users/contact/phone/resend-otp', data).then((r) => r.data),

  revertPhoneChange: (data: RevertChangeRequest): Promise<RevertChangeResponse> =>
    axios.post<RevertChangeResponse>('/cloud-api/users/contact/phone/revert', data).then((r) => r.data),
};
