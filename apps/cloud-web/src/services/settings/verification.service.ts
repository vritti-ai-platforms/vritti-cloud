import { axios } from '@vritti/quantum-ui/axios';

export interface IdentityVerificationResponse {
  expiresAt: string;
}

export interface SuccessResponse {
  success: boolean;
  message: string;
}

export interface RequestChangeResponse {
  expiresAt: string;
}

// Requests identity verification OTP for email change
export function requestEmailIdentityVerification(): Promise<IdentityVerificationResponse> {
  return axios
    .post<IdentityVerificationResponse>('/settings/contact/email/request-identity-verification')
    .then((r) => r.data);
}

// Verifies identity OTP for email change
export function verifyEmailIdentity(data: { otpCode: string }): Promise<SuccessResponse> {
  return axios.post<SuccessResponse>('/settings/contact/email/verify-identity', data).then((r) => r.data);
}

// Submits a new email address for change
export function requestEmailChange(data: { newEmail: string }): Promise<RequestChangeResponse> {
  return axios.post<RequestChangeResponse>('/settings/contact/email/submit-new-email', data).then((r) => r.data);
}

// Verifies OTP sent to the new email address
export function verifyEmailChange(data: { otpCode: string }): Promise<SuccessResponse> {
  return axios.post<SuccessResponse>('/settings/contact/email/verify-new-email', data).then((r) => r.data);
}

// Resends OTP for email verification
export function resendEmailOtp(): Promise<SuccessResponse> {
  return axios.post<SuccessResponse>('/settings/contact/email/resend-otp').then((r) => r.data);
}

// Requests identity verification OTP for phone change
export function requestPhoneIdentityVerification(): Promise<IdentityVerificationResponse> {
  return axios
    .post<IdentityVerificationResponse>('/settings/contact/phone/request-identity-verification')
    .then((r) => r.data);
}

// Verifies identity OTP for phone change
export function verifyPhoneIdentity(data: { otpCode: string }): Promise<SuccessResponse> {
  return axios.post<SuccessResponse>('/settings/contact/phone/verify-identity', data).then((r) => r.data);
}

// Submits a new phone number for change
export function requestPhoneChange(data: { newPhone: string; newPhoneCountry: string }): Promise<RequestChangeResponse> {
  return axios.post<RequestChangeResponse>('/settings/contact/phone/submit-new-phone', data).then((r) => r.data);
}

// Verifies OTP sent to the new phone number
export function verifyPhoneChange(data: { otpCode: string }): Promise<SuccessResponse> {
  return axios.post<SuccessResponse>('/settings/contact/phone/verify-new-phone', data).then((r) => r.data);
}

// Resends OTP for phone verification
export function resendPhoneOtp(): Promise<SuccessResponse> {
  return axios.post<SuccessResponse>('/settings/contact/phone/resend-otp').then((r) => r.data);
}
