import { Redirect, Stack, useSegments } from "expo-router";

import { useAuth } from "@/src/presentation/auth/AuthProvider";
import { requiresAuthenticatedOnboardingRoute } from "@/src/presentation/auth/onboardingRoute";

export default function OnboardingLayout() {
  const { loading, session } = useAuth();
  const segments = useSegments();
  const route = (segments as readonly string[])[1];

  if (loading) return null;
  if (!session && requiresAuthenticatedOnboardingRoute(route)) {
    return <Redirect href="/(onboarding)/welcome" />;
  }
  return <Stack screenOptions={{ headerShown: false }} />;
}
