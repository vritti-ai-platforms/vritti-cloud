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
    business: r.one.businesses({
      from: r.organizations.businessId,
      to: r.businesses.id,
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

  // Version relations
  versions: {
    features: r.many.features(),
    microfrontends: r.many.microfrontends(),
    featureMicrofrontends: r.many.featureMicrofrontends(),
    apps: r.many.apps(),
    roleTemplates: r.many.roleTemplates(),
    roleTemplateApps: r.many.roleTemplateApps(),
    featurePermissions: r.many.featurePermissions(),
    roleTemplateFeaturePermissions: r.many.roleTemplateFeaturePermissions(),
    appFeatures: r.many.appFeatures(),
  },

  // Plan relations
  plans: {
    organizations: r.many.organizations(),
    prices: r.many.prices(),
    planApps: r.many.planApps(),
    businesses: r.many.businesses({
      from: r.plans.id.through(r.prices.planId),
      to: r.businesses.id.through(r.prices.businessId),
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
      from: r.plans.id.through(r.deploymentBusinessPlans.planId),
      to: r.deployments.id.through(r.deploymentBusinessPlans.deploymentId),
    }),
  },

  // Business relations
  businesses: {
    organizations: r.many.organizations(),
    prices: r.many.prices(),
    roleTemplates: r.many.roleTemplates(),
    plans: r.many.plans({
      from: r.businesses.id.through(r.prices.businessId),
      to: r.plans.id.through(r.prices.planId),
    }),
    deployments: r.many.deployments({
      from: r.businesses.id.through(r.deploymentBusinessPlans.businessId),
      to: r.deployments.id.through(r.deploymentBusinessPlans.deploymentId),
    }),
  },

  // Deployment relations
  deployments: {
    organizations: r.many.organizations(),
    businessPlans: r.many.deploymentBusinessPlans(),
    plans: r.many.plans({
      from: r.deployments.id.through(r.deploymentBusinessPlans.deploymentId),
      to: r.plans.id.through(r.deploymentBusinessPlans.planId),
    }),
    businesses: r.many.businesses({
      from: r.deployments.id.through(r.deploymentBusinessPlans.deploymentId),
      to: r.businesses.id.through(r.deploymentBusinessPlans.businessId),
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
    business: r.one.businesses({
      from: r.prices.businessId,
      to: r.businesses.id,
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

  // Deployment-Business-Plan join table relations
  deploymentBusinessPlans: {
    deployment: r.one.deployments({
      from: r.deploymentBusinessPlans.deploymentId,
      to: r.deployments.id,
    }),
    plan: r.one.plans({
      from: r.deploymentBusinessPlans.planId,
      to: r.plans.id,
    }),
    business: r.one.businesses({
      from: r.deploymentBusinessPlans.businessId,
      to: r.businesses.id,
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
    appVersion: r.one.versions({
      from: r.features.versionId,
      to: r.versions.id,
    }),
    featureMicrofrontends: r.many.featureMicrofrontends(),
    featurePermissions: r.many.featurePermissions(),
    appFeatures: r.many.appFeatures(),
    roleTemplateFeaturePermissions: r.many.roleTemplateFeaturePermissions(),
  },

  // Microfrontend relations
  microfrontends: {
    appVersion: r.one.versions({
      from: r.microfrontends.versionId,
      to: r.versions.id,
    }),
    featureMicrofrontends: r.many.featureMicrofrontends(),
  },

  // Feature-Microfrontend junction relations
  featureMicrofrontends: {
    appVersion: r.one.versions({
      from: r.featureMicrofrontends.versionId,
      to: r.versions.id,
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
    appVersion: r.one.versions({
      from: r.apps.versionId,
      to: r.versions.id,
    }),
    appFeatures: r.many.appFeatures(),
    appPrices: r.many.appPrices(),
    roleTemplateApps: r.many.roleTemplateApps(),
  },

  // App-Feature junction relations
  appFeatures: {
    appVersion: r.one.versions({
      from: r.appFeatures.versionId,
      to: r.versions.id,
    }),
    app: r.one.apps({ from: r.appFeatures.appId, to: r.apps.id }),
    feature: r.one.features({ from: r.appFeatures.featureId, to: r.features.id }),
  },

  // Feature permission relations
  featurePermissions: {
    appVersion: r.one.versions({
      from: r.featurePermissions.versionId,
      to: r.versions.id,
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

  // Role template relations
  roleTemplates: {
    appVersion: r.one.versions({
      from: r.roleTemplates.versionId,
      to: r.versions.id,
    }),
    business: r.one.businesses({ from: r.roleTemplates.businessId, to: r.businesses.id }),
    roleTemplateFeaturePermissions: r.many.roleTemplateFeaturePermissions(),
    roleTemplateApps: r.many.roleTemplateApps(),
  },

  // Role-Template-App junction relations
  roleTemplateApps: {
    appVersion: r.one.versions({ from: r.roleTemplateApps.versionId, to: r.versions.id }),
    roleTemplate: r.one.roleTemplates({ from: r.roleTemplateApps.roleTemplateId, to: r.roleTemplates.id }),
    app: r.one.apps({ from: r.roleTemplateApps.appId, to: r.apps.id }),
  },

  // Role-Template-Feature-Permission junction relations
  roleTemplateFeaturePermissions: {
    appVersion: r.one.versions({
      from: r.roleTemplateFeaturePermissions.versionId,
      to: r.versions.id,
    }),
    roleTemplate: r.one.roleTemplates({
      from: r.roleTemplateFeaturePermissions.roleTemplateId,
      to: r.roleTemplates.id,
    }),
    feature: r.one.features({
      from: r.roleTemplateFeaturePermissions.featureId,
      to: r.features.id,
    }),
  },
}));
