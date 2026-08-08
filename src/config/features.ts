import { environment } from "@/src/config/env";

export interface FeatureFlags {
  developmentRoutes: boolean;
}

export const featureFlags: FeatureFlags = Object.freeze({
  developmentRoutes: environment.EXPO_PUBLIC_APP_ENV === "development" && environment.EXPO_PUBLIC_ENABLE_DEV_ROUTES
});
