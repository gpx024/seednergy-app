import { describe, expect, it } from "vitest";

import { createAuthRedirectUrl } from "@/src/infrastructure/auth/authRedirect";
import { toSecureStoreKey } from "@/src/infrastructure/supabase/secureStoreKey";
import { requiresAuthenticatedOnboardingRoute } from "@/src/presentation/auth/onboardingRoute";
import { resolvePostAuthenticationRoute } from "@/src/presentation/auth/postAuthRoute";

describe("Stage 4 authentication safeguards", () => {
  it("lets the current Expo runtime choose the authentication callback scheme", () => {
    const createUrl = (path: string) => `exp://192.168.1.93:8081/--/${path}`;
    expect(createAuthRedirectUrl(createUrl)).toBe("exp://192.168.1.93:8081/--/auth/callback");
  });

  it("creates Expo SecureStore-compatible keys", () => {
    expect(toSecureStoreKey("sb-project-auth-token", ".chunks")).toBe("sb-project-auth-token.chunks");
    expect(toSecureStoreKey("https://project.supabase.co:auth", ".0")).toBe("https...project.supabase.co.auth.0");
    expect(toSecureStoreKey("unsafe/key:value")).toMatch(/^[A-Za-z0-9._-]+$/);
  });

  it("does not let cached onboarding steps bypass account creation", () => {
    expect(requiresAuthenticatedOnboardingRoute("welcome")).toBe(false);
    expect(requiresAuthenticatedOnboardingRoute("create-account")).toBe(false);
    expect(requiresAuthenticatedOnboardingRoute("sign-in")).toBe(false);
    expect(requiresAuthenticatedOnboardingRoute("time")).toBe(true);
    expect(requiresAuthenticatedOnboardingRoute("notifications")).toBe(true);
  });

  it("returns existing growers to the app after Google authentication", async () => {
    const profile = { onboardingCompletedAt: "2026-08-01T10:00:00.000Z" };
    const route = await resolvePostAuthenticationRoute({ getMine: async () => profile as never }, { getAll: async () => [] });
    expect(route).toBe("/(tabs)/home");
  });

  it("uses existing cycles as a legacy onboarding-completion signal", async () => {
    const route = await resolvePostAuthenticationRoute({ getMine: async () => null }, { getAll: async () => [{ id: "cycle" }] as never });
    expect(route).toBe("/(tabs)/home");
  });

  it("starts onboarding only for a genuinely new account", async () => {
    const route = await resolvePostAuthenticationRoute({ getMine: async () => null }, { getAll: async () => [] });
    expect(route).toBe("/(onboarding)/profile-basics");
  });
});
