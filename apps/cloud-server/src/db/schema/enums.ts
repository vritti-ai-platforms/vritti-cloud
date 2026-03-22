import { cloudSchema } from './cloud-schema';

// Tenant-related enums
export const databaseTypeEnum = cloudSchema.enum('DatabaseType', ['SHARED', 'DEDICATED']);
export const tenantStatusEnum = cloudSchema.enum('TenantStatus', ['ACTIVE', 'SUSPENDED', 'ARCHIVED']);

// User account enums
export const accountStatusEnum = cloudSchema.enum('AccountStatus', ['PENDING_VERIFICATION', 'ACTIVE', 'INACTIVE']);

export const onboardingStepEnum = cloudSchema.enum('OnboardingStep', [
  'EMAIL_VERIFICATION',
  'SET_PASSWORD',
  'MOBILE_VERIFICATION',
  'TWO_FACTOR_SETUP',
  'COMPLETE',
]);

// Verification enums
export const verificationChannelEnum = cloudSchema.enum('verification_channel', [
  'EMAIL', // Outbound email with OTP
  'SMS_OUT', // Outbound SMS with OTP (we send to user)
  'SMS_IN', // Inbound SMS with code (user sends to us via QR)
  'WHATSAPP_IN', // Inbound WhatsApp with code (user sends to us via QR)
]);

export const mfaMethodEnum = cloudSchema.enum('MfaMethod', ['TOTP', 'PASSKEY']);

// OAuth enums
export const oauthProviderTypeEnum = cloudSchema.enum('OAuthProviderType', [
  'GOOGLE',
  'MICROSOFT',
  'APPLE',
  'FACEBOOK',
  'X',
]);

// Signup method enum
export const signupMethodEnum = cloudSchema.enum('SignupMethod', ['email', 'oauth']);

// Session enums
export const sessionTypeEnum = cloudSchema.enum('SessionType', ['ONBOARDING', 'CLOUD', 'COMPANY', 'RESET']);

// TypeScript type exports for use in DTOs and services
export type DatabaseType = (typeof databaseTypeEnum.enumValues)[number];
export type TenantStatus = (typeof tenantStatusEnum.enumValues)[number];
export type AccountStatus = (typeof accountStatusEnum.enumValues)[number];
export type OnboardingStep = (typeof onboardingStepEnum.enumValues)[number];
export type VerificationChannel = (typeof verificationChannelEnum.enumValues)[number];
export type MfaMethod = (typeof mfaMethodEnum.enumValues)[number];
export type OAuthProviderType = (typeof oauthProviderTypeEnum.enumValues)[number];
export type SignupMethod = (typeof signupMethodEnum.enumValues)[number];
export type SessionType = (typeof sessionTypeEnum.enumValues)[number];

// Runtime enum value objects for use in code
export const DatabaseTypeValues = {
  SHARED: 'SHARED' as const,
  DEDICATED: 'DEDICATED' as const,
};

export const TenantStatusValues = {
  ACTIVE: 'ACTIVE' as const,
  SUSPENDED: 'SUSPENDED' as const,
  ARCHIVED: 'ARCHIVED' as const,
};

export const AccountStatusValues = {
  PENDING_VERIFICATION: 'PENDING_VERIFICATION' as const,
  ACTIVE: 'ACTIVE' as const,
  INACTIVE: 'INACTIVE' as const,
};

export const OnboardingStepValues = {
  EMAIL_VERIFICATION: 'EMAIL_VERIFICATION' as const,
  SET_PASSWORD: 'SET_PASSWORD' as const,
  MOBILE_VERIFICATION: 'MOBILE_VERIFICATION' as const,
  TWO_FACTOR_SETUP: 'TWO_FACTOR_SETUP' as const,
  COMPLETE: 'COMPLETE' as const,
};

export const VerificationChannelValues = {
  EMAIL: 'EMAIL' as const,
  SMS_OUT: 'SMS_OUT' as const,
  SMS_IN: 'SMS_IN' as const,
  WHATSAPP_IN: 'WHATSAPP_IN' as const,
};

export const MfaMethodValues = {
  TOTP: 'TOTP' as const,
  PASSKEY: 'PASSKEY' as const,
};

export const OAuthProviderTypeValues = {
  GOOGLE: 'GOOGLE' as const,
  MICROSOFT: 'MICROSOFT' as const,
  APPLE: 'APPLE' as const,
  FACEBOOK: 'FACEBOOK' as const,
  X: 'X' as const,
};

export const SignupMethodValues = {
  EMAIL: 'email' as const,
  OAUTH: 'oauth' as const,
};

export const SessionTypeValues = {
  ONBOARDING: 'ONBOARDING' as const,
  CLOUD: 'CLOUD' as const,
  COMPANY: 'COMPANY' as const,
  RESET: 'RESET' as const,
};

export const mediaStatusEnum = cloudSchema.enum('MediaStatus', ['pending', 'ready', 'failed', 'deleted']);
export type MediaStatus = (typeof mediaStatusEnum.enumValues)[number];
export const MediaStatusValues = {
  PENDING: 'pending' as const,
  READY: 'ready' as const,
  FAILED: 'failed' as const,
  DELETED: 'deleted' as const,
};

// Organization enums
export const orgSizeEnum = cloudSchema.enum('OrgSize', ['0-10', '10-20', '20-50', '50-100', '100-500', '500+']);
export type OrgSize = (typeof orgSizeEnum.enumValues)[number];
export const OrgSizeValues = {
  s0_10: '0-10' as const,
  s10_20: '10-20' as const,
  s20_50: '20-50' as const,
  s50_100: '50-100' as const,
  s100_500: '100-500' as const,
  s500plus: '500+' as const,
};

export const orgMemberRoleEnum = cloudSchema.enum('OrgMemberRole', ['Owner', 'Admin']);
export type OrgMemberRole = (typeof orgMemberRoleEnum.enumValues)[number];
export const OrgMemberRoleValues = { Owner: 'Owner' as const, Admin: 'Admin' as const };

// Deployment enums
export const deploymentStatusEnum = cloudSchema.enum('DeploymentStatus', ['active', 'stopped', 'Provisioning']);
export const deploymentTypeEnum = cloudSchema.enum('DeploymentType', ['shared', 'dedicated']);

export type DeploymentStatus = (typeof deploymentStatusEnum.enumValues)[number];
export type DeploymentType = (typeof deploymentTypeEnum.enumValues)[number];

export const DeploymentStatusValues = {
  active: 'active' as const,
  stopped: 'stopped' as const,
  Provisioning: 'Provisioning' as const,
};

export const DeploymentTypeValues = {
  shared: 'shared' as const,
  dedicated: 'dedicated' as const,
};

// Feature permission type — what kind of access a permission grants
export const featureTypeEnum = cloudSchema.enum('FeatureType', [
  'VIEW',
  'CREATE',
  'EDIT',
  'DELETE',
  'EXPORT',
  'IMPORT',
  'APPROVE',
  'MANAGE',
]);
export type FeatureType = (typeof featureTypeEnum.enumValues)[number];
export const FeatureTypeValues = {
  VIEW: 'VIEW' as const,
  CREATE: 'CREATE' as const,
  EDIT: 'EDIT' as const,
  DELETE: 'DELETE' as const,
  EXPORT: 'EXPORT' as const,
  IMPORT: 'IMPORT' as const,
  APPROVE: 'APPROVE' as const,
  MANAGE: 'MANAGE' as const,
};

// App version lifecycle status
export const appVersionStatusEnum = cloudSchema.enum('AppVersionStatus', ['DRAFT', 'READY', 'PUBLISHED']);
export type AppVersionStatus = (typeof appVersionStatusEnum.enumValues)[number];
export const AppVersionStatusValues = {
  DRAFT: 'DRAFT' as const,
  READY: 'READY' as const,
  PUBLISHED: 'PUBLISHED' as const,
};

// App microfrontend platform
export const appPlatformEnum = cloudSchema.enum('AppPlatform', ['WEB', 'MOBILE']);
export type AppPlatform = (typeof appPlatformEnum.enumValues)[number];
export const AppPlatformValues = {
  WEB: 'WEB' as const,
  MOBILE: 'MOBILE' as const,
};

// Role scope — how far a role's access extends in the BU tree
export const roleScopeEnum = cloudSchema.enum('RoleScope', ['GLOBAL', 'SUBTREE', 'SINGLE_BU']);
export type RoleScope = (typeof roleScopeEnum.enumValues)[number];
export const RoleScopeValues = {
  GLOBAL: 'GLOBAL' as const,
  SUBTREE: 'SUBTREE' as const,
  SINGLE_BU: 'SINGLE_BU' as const,
};
