import { environment } from "@/src/config/env";

export const legalLinks = Object.freeze({
  privacyPolicy: environment.EXPO_PUBLIC_PRIVACY_POLICY_URL,
  terms: environment.EXPO_PUBLIC_TERMS_URL,
  support: environment.EXPO_PUBLIC_SUPPORT_URL
});
