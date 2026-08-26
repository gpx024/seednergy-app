import * as Crypto from "expo-crypto";
import { useState } from "react";

import { startedAtForSimulatedCycleDay } from "@/src/application/cycles/developmentSimulation";
import type { CycleView } from "@/src/application/cycles/cycleView";
import { featureFlags } from "@/src/config/features";
import { notificationService } from "@/src/infrastructure/notifications/ExpoNotificationService";
import { cycleRepository } from "@/src/infrastructure/repositories/SupabaseCycleRepository";

export function useDevelopmentCycleSimulation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function simulateHarvestReady(source: CycleView): Promise<string> {
    if (!featureFlags.developmentRoutes) throw new Error("Development simulation is disabled in this build.");
    const harvestStage = source.seed.stages.find((stage) => stage.harvestReady);
    if (!harvestStage) throw new Error("This seed has no authored harvest-ready stage.");
    setLoading(true); setError(null);
    try {
      const now = new Date();
      const simulated = await cycleRepository.start({
        seedId: source.seed.id,
        seedContentVersion: source.seed.contentVersion,
        startedAt: startedAtForSimulatedCycleDay(harvestStage.startDay, now),
        timezone: source.cycle.timezone,
        clientEventId: Crypto.randomUUID()
      });
      await cycleRepository.saveEvent({
        cycleId: simulated.id,
        eventType: "development_cycle_simulated",
        payload: { sourceCycleId: source.cycle.id, simulatedDay: harvestStage.startDay },
        occurredAt: now.toISOString(),
        clientEventId: Crypto.randomUUID()
      });
      await notificationService.refreshCycle(simulated.id).catch(() => undefined);
      return simulated.id;
    } catch (reason) {
      const nextError = reason instanceof Error ? reason : new Error("The development cycle could not be created.");
      setError(nextError); throw nextError;
    } finally { setLoading(false); }
  }

  return { simulateHarvestReady, loading, error };
}
