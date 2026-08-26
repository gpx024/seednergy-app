import * as Crypto from "expo-crypto";
import { useState } from "react";

import { contentRepository } from "@/src/infrastructure/repositories/SupabaseContentRepository";
import { analyticsService } from "@/src/infrastructure/analytics/SupabaseAnalyticsService";
import { cycleRepository } from "@/src/infrastructure/repositories/SupabaseCycleRepository";
import { profileRepository } from "@/src/infrastructure/repositories/SupabaseProfileRepository";
import { useAuth } from "@/src/presentation/auth/AuthProvider";
import { useOnboarding } from "@/src/presentation/onboarding/OnboardingProvider";

export function useStartFirstCycle() {
  const auth = useAuth();
  const onboarding = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function start(): Promise<string> {
    setLoading(true); setError(null);
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const metadataName = auth.user?.user_metadata.display_name ?? auth.user?.user_metadata.full_name;
      await profileRepository.completeOnboarding({
        ...onboarding.answers,
        displayName: typeof metadataName === "string" ? metadataName : null,
        timezone,
        notificationsEnabled: false
      });
      const cress = await contentRepository.getPublishedSeed("cress");
      if (!cress) throw new Error("Cress content is unavailable.");
      const cycle = await cycleRepository.start({
        seedId: cress.id,
        seedContentVersion: cress.contentVersion,
        startedAt: new Date().toISOString(),
        timezone,
        clientEventId: Crypto.randomUUID()
      });
      await Promise.all([
        analyticsService.track("onboarding_completed").catch(() => undefined),
        analyticsService.track("cycle_started", { seed_slug: cress.slug, source: "onboarding" }).catch(() => undefined)
      ]);
      await onboarding.clear();
      return cycle.id;
    } catch (reason) {
      const nextError = reason instanceof Error ? reason : new Error("Your first cycle could not be started.");
      setError(nextError);
      throw nextError;
    } finally { setLoading(false); }
  }

  return { start, loading, error };
}
