import { defineRelations } from '@vritti/api-sdk/drizzle-orm';
import * as schema from './index';

export const relations = defineRelations(schema, (r) => ({
  // User relations
  users: {
    verifications: r.many.verifications(),
    mfaAuth: r.many.mfaAuth(),
    oauthProviders: r.many.oauthProviders(),
    sessions: r.many.sessions(),
    organizationMembers: r.many.organizationMembers(),
  },

  // Session relations
  sessions: {
    user: r.one.users({
      from: r.sessions.userId,
      to: r.users.id,
    }),
  },

  // OAuth provider relations
  oauthProviders: {
    user: r.one.users({
      from: r.oauthProviders.userId,
      to: r.users.id,
    }),
  },

  // Verification relations
  verifications: {
    user: r.one.users({
      from: r.verifications.userId,
      to: r.users.id,
    }),
  },

  // MFA auth relations
  mfaAuth: {
    user: r.one.users({
      from: r.mfaAuth.userId,
      to: r.users.id,
    }),
  },

  // Organization relations
  organizations: {
    members: r.many.organizationMembers(),
    plan: r.one.plans({
      from: r.organizations.planId,
      to: r.plans.id,
    }),
    industry: r.one.industries({
      from: r.organizations.industryId,
      to: r.industries.id,
    }),
    deployment: r.one.deployments({
      from: r.organizations.deploymentId,
      to: r.deployments.id,
    }),
  },

  // Organization member relations
  organizationMembers: {
    organization: r.one.organizations({
      from: r.organizationMembers.organizationId,
      to: r.organizations.id,
    }),
    user: r.one.users({
      from: r.organizationMembers.userId,
      to: r.users.id,
    }),
  },

  // App version relations
  appVersions: {
    features: r.many.features(),
    microfrontends: r.many.microfrontends(),
    featureMicrofrontends: r.many.featureMicrofrontends(),
    apps: r.many.apps(),
    roles: r.many.roles(),
    roleApps: r.many.roleApps(),
    featurePermissions: r.many.featurePermissions(),
    roleFeaturePermissions: r.many.roleFeaturePermissions(),
    appFeatures: r.many.appFeatures(),
  },

  // Plan relations
  plans: {
    organizations: r.many.organizations(),
    prices: r.many.prices(),
    planApps: r.many.planApps(),
    industries: r.many.industries({
      from: r.plans.id.through(r.prices.planId),
      to: r.industries.id.through(r.prices.industryId),
    }),
    regions: r.many.regions({
      from: r.plans.id.through(r.prices.planId),
      to: r.regions.id.through(r.prices.regionId),
    }),
    cloudProviders: r.many.cloudProviders({
      from: r.plans.id.through(r.prices.planId),
      to: r.cloudProviders.id.through(r.prices.providerId),
    }),
    deployments: r.many.deployments({
      from: r.plans.id.through(r.deploymentIndustryPlans.planId),
      to: r.deployments.id.through(r.deploymentIndustryPlans.deploymentId),
    }),
  },

  // Industry relations
  industries: {
    organizations: r.many.organizations(),
    prices: r.many.prices(),
    roles: r.many.roles(),
    plans: r.many.plans({
      from: r.industries.id.through(r.prices.industryId),
      to: r.plans.id.through(r.prices.planId),
    }),
    deployments: r.many.deployments({
      from: r.industries.id.through(r.deploymentIndustryPlans.industryId),
      to: r.deployments.id.through(r.deploymentIndustryPlans.deploymentId),
    }),
  },

  // Deployment relations
  deployments: {
    organizations: r.many.organizations(),
    industryPlans: r.many.deploymentIndustryPlans(),
    plans: r.many.plans({
      from: r.deployments.id.through(r.deploymentIndustryPlans.deploymentId),
      to: r.plans.id.through(r.deploymentIndustryPlans.planId),
    }),
    industries: r.many.industries({
      from: r.deployments.id.through(r.deploymentIndustryPlans.deploymentId),
      to: r.industries.id.through(r.deploymentIndustryPlans.industryId),
    }),
    region: r.one.regions({
      from: r.deployments.regionId,
      to: r.regions.id,
    }),
    cloudProvider: r.one.cloudProviders({
      from: r.deployments.cloudProviderId,
      to: r.cloudProviders.id,
    }),
  },

  // Region relations
  regions: {
    appPrices: r.many.appPrices(),
    cloudProviders: r.many.cloudProviders({
      from: r.regions.id.through(r.regionCloudProviders.regionId),
      to: r.cloudProviders.id.through(r.regionCloudProviders.providerId),
    }),
    prices: r.many.prices(),
    plans: r.many.plans({
      from: r.regions.id.through(r.prices.regionId),
      to: r.plans.id.through(r.prices.planId),
    }),
  },

  // Cloud provider relations
  cloudProviders: {
    appPrices: r.many.appPrices(),
    regions: r.many.regions({
      from: r.cloudProviders.id.through(r.regionCloudProviders.providerId),
      to: r.regions.id.through(r.regionCloudProviders.regionId),
    }),
    prices: r.many.prices(),
    plans: r.many.plans({
      from: r.cloudProviders.id.through(r.prices.providerId),
      to: r.plans.id.through(r.prices.planId),
    }),
  },

  // Prices relations
  prices: {
    plan: r.one.plans({
      from: r.prices.planId,
      to: r.plans.id,
    }),
    industry: r.one.industries({
      from: r.prices.industryId,
      to: r.industries.id,
    }),
    region: r.one.regions({
      from: r.prices.regionId,
      to: r.regions.id,
    }),
    cloudProvider: r.one.cloudProviders({
      from: r.prices.providerId,
      to: r.cloudProviders.id,
    }),
  },

  // Deployment-Industry-Plan join table relations
  deploymentIndustryPlans: {
    deployment: r.one.deployments({
      from: r.deploymentIndustryPlans.deploymentId,
      to: r.deployments.id,
    }),
    plan: r.one.plans({
      from: r.deploymentIndustryPlans.planId,
      to: r.plans.id,
    }),
    industry: r.one.industries({
      from: r.deploymentIndustryPlans.industryId,
      to: r.industries.id,
    }),
  },

  // Region-CloudProvider join table relations
  regionCloudProviders: {
    region: r.one.regions({
      from: r.regionCloudProviders.regionId,
      to: r.regions.id,
    }),
    cloudProvider: r.one.cloudProviders({
      from: r.regionCloudProviders.providerId,
      to: r.cloudProviders.id,
    }),
  },

  // Feature relations
  features: {
    appVersion: r.one.appVersions({
      from: r.features.appVersionId,
      to: r.appVersions.id,
    }),
    featureMicrofrontends: r.many.featureMicrofrontends(),
    featurePermissions: r.many.featurePermissions(),
    appFeatures: r.many.appFeatures(),
    roleFeaturePermissions: r.many.roleFeaturePermissions(),
  },

  // Microfrontend relations
  microfrontends: {
    appVersion: r.one.appVersions({
      from: r.microfrontends.appVersionId,
      to: r.appVersions.id,
    }),
    featureMicrofrontends: r.many.featureMicrofrontends(),
  },

  // Feature-Microfrontend junction relations
  featureMicrofrontends: {
    appVersion: r.one.appVersions({
      from: r.featureMicrofrontends.appVersionId,
      to: r.appVersions.id,
    }),
    feature: r.one.features({
      from: r.featureMicrofrontends.featureId,
      to: r.features.id,
    }),
    microfrontend: r.one.microfrontends({
      from: r.featureMicrofrontends.microfrontendId,
      to: r.microfrontends.id,
    }),
  },

  // App relations
  apps: {
    appVersion: r.one.appVersions({
      from: r.apps.appVersionId,
      to: r.appVersions.id,
    }),
    appFeatures: r.many.appFeatures(),
    appPrices: r.many.appPrices(),
    roleApps: r.many.roleApps(),
  },

  // App-Feature junction relations
  appFeatures: {
    appVersion: r.one.appVersions({
      from: r.appFeatures.appVersionId,
      to: r.appVersions.id,
    }),
    app: r.one.apps({ from: r.appFeatures.appId, to: r.apps.id }),
    feature: r.one.features({ from: r.appFeatures.featureId, to: r.features.id }),
  },

  // Feature permission relations
  featurePermissions: {
    appVersion: r.one.appVersions({
      from: r.featurePermissions.appVersionId,
      to: r.appVersions.id,
    }),
    feature: r.one.features({
      from: r.featurePermissions.featureId,
      to: r.features.id,
    }),
  },

  // App-Price relations
  appPrices: {
    app: r.one.apps({ from: r.appPrices.appId, to: r.apps.id }),
    region: r.one.regions({ from: r.appPrices.regionId, to: r.regions.id }),
    cloudProvider: r.one.cloudProviders({ from: r.appPrices.cloudProviderId, to: r.cloudProviders.id }),
  },

  // Plan-App junction relations
  planApps: {
    plan: r.one.plans({ from: r.planApps.planId, to: r.plans.id }),
  },

  // Role relations
  roles: {
    appVersion: r.one.appVersions({
      from: r.roles.appVersionId,
      to: r.appVersions.id,
    }),
    industry: r.one.industries({ from: r.roles.industryId, to: r.industries.id }),
    roleFeaturePermissions: r.many.roleFeaturePermissions(),
    roleApps: r.many.roleApps(),
  },

  // Role-App junction relations
  roleApps: {
    appVersion: r.one.appVersions({ from: r.roleApps.appVersionId, to: r.appVersions.id }),
    role: r.one.roles({ from: r.roleApps.roleId, to: r.roles.id }),
    app: r.one.apps({ from: r.roleApps.appId, to: r.apps.id }),
  },

  // Role-Feature-Permission junction relations
  roleFeaturePermissions: {
    appVersion: r.one.appVersions({
      from: r.roleFeaturePermissions.appVersionId,
      to: r.appVersions.id,
    }),
    role: r.one.roles({
      from: r.roleFeaturePermissions.roleId,
      to: r.roles.id,
    }),
    feature: r.one.features({
      from: r.roleFeaturePermissions.featureId,
      to: r.features.id,
    }),
  },
}));
