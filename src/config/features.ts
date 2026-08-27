import { environment } from "@/src/config/env";

export interface FeatureFlags {
  developmentRoutes: boolean;
  appleAuthentication: boolean;
  emailAuthentication: boolean;
  fixturePhotoChecks: boolean;
  payments: boolean;
  pushNotifications: boolean;
}

export const featureFlags: FeatureFlags = Object.freeze({
  developmentRoutes: environment.EXPO_PUBLIC_APP_ENV !== "production" && environment.EXPO_PUBLIC_ENABLE_DEV_ROUTES,
  appleAuthentication: environment.EXPO_PUBLIC_ENABLE_APPLE_AUTH,
  emailAuthentication: environment.EXPO_PUBLIC_ENABLE_EMAIL_AUTH,
  fixturePhotoChecks: environment.EXPO_PUBLIC_PHOTO_CHECK_PROVIDER === "fixture",
  payments: environment.EXPO_PUBLIC_ENABLE_PAYMENTS,
  pushNotifications: environment.EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS
});
