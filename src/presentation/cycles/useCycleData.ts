import * as Crypto from "expo-crypto";
import { useCallback, useEffect, useState } from "react";

import { buildCycleView, prioritizeCycleViews, type CycleView } from "@/src/application/cycles/cycleView";
import { startedAtForSimulatedCycleDay } from "@/src/application/cycles/developmentSimulation";
import { featureFlags } from "@/src/config/features";
import { contentRepository } from "@/src/infrastructure/repositories/SupabaseContentRepository";
import { cycleRepository } from "@/src/infrastructure/repositories/SupabaseCycleRepository";
import { notificationService } from "@/src/infrastructure/notifications/ExpoNotificationService";
import { analyticsService } from "@/src/infrastructure/analytics/SupabaseAnalyticsService";

interface Resource<T> {
  data: T;
  loading: boolean;
  error: Error | null;
  reload(): Promise<void>;
}

let prelaunchHarvestDemoPromise: Promise<boolean> | null = null;

async function hydrateCycleViews(cycles: Awaited<ReturnType<typeof cycleRepository.getAll>>): Promise<readonly CycleView[]> {
  return Promise.all(cycles.map(async (cycle) => {
    const seed = await contentRepository.getPublishedSeedById(cycle.seedId, cycle.seedContentVersion);
    if (!seed) throw new Error("The authored seed content for this cycle is unavailable.");
    return buildCycleView(cycle, seed);
  }));
}

async function ensurePrelaunchHarvestDemo(views: readonly CycleView[]): Promise<boolean> {
  if (!featureFlags.prelaunchHarvestDemo || views.some((view) => view.priority === "harvest_ready")) return false;
  if (!prelaunchHarvestDemoPromise) {
    prelaunchHarvestDemoPromise = (async () => {
      const latestViews = await hydrateCycleViews(await cycleRepository.getActive());
      if (latestViews.some((view) => view.priority === "harvest_ready")) return false;
      const source = latestViews.find((view) => view.seed.stages.some((stage) => stage.harvestReady));
      const seed = source?.seed ?? await contentRepository.getPublishedSeed("cress");
      const harvestStage = seed?.stages.find((stage) => stage.harvestReady);
      if (!seed || !harvestStage) return false;
      const now = new Date();
      const simulated = await cycleRepository.start({
        seedId: seed.id,
        seedContentVersion: seed.contentVersion,
        startedAt: startedAtForSimulatedCycleDay(harvestStage.startDay, now),
        timezone: source?.cycle.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
        clientEventId: Crypto.randomUUID()
      });
      await cycleRepository.saveEvent({
        cycleId: simulated.id,
        eventType: "prelaunch_harvest_demo_created",
        payload: { simulatedDay: harvestStage.startDay, purpose: "private_acceptance_testing" },
        occurredAt: now.toISOString(),
        clientEventId: Crypto.randomUUID()
      }).catch(() => undefined);
      return true;
    })();
  }
  try { return await prelaunchHarvestDemoPromise; }
  finally { prelaunchHarvestDemoPromise = null; }
}

async function hydrateCycles(activeOnly: boolean): Promise<readonly CycleView[]> {
  let cycles = activeOnly ? await cycleRepository.getActive() : await cycleRepository.getAll();
  let views = await hydrateCycleViews(cycles);
  if (await ensurePrelaunchHarvestDemo(views)) {
    cycles = activeOnly ? await cycleRepository.getActive() : await cycleRepository.getAll();
    views = await hydrateCycleViews(cycles);
  }
  return activeOnly ? prioritizeCycleViews(views) : views;
}

export function useCycleList(activeOnly = true): Resource<readonly CycleView[]> {
  const [data, setData] = useState<readonly CycleView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { setData(await hydrateCycles(activeOnly)); }
    catch (reason) { setError(toError(reason)); }
    finally { setLoading(false); }
  }, [activeOnly]);
  useEffect(() => { void reload(); }, [reload]);
  return { data, loading, error, reload };
}

export function useStartCycle() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  async function start(slug: string): Promise<string> {
    setLoading(true); setError(null);
    try {
      const seed = await contentRepository.getPublishedSeed(slug);
      if (!seed || seed.accessType !== "free") throw new Error("This seed is not available to start.");
      const cycle = await cycleRepository.start({ seedId: seed.id, seedContentVersion: seed.contentVersion, startedAt: new Date().toISOString(), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, clientEventId: Crypto.randomUUID() });
      await analyticsService.track("cycle_started", { seed_slug: seed.slug, source: "seed_detail" }).catch(() => undefined);
      await notificationService.refreshCycle(cycle.id).catch(() => undefined);
      return cycle.id;
    } catch (reason) {
      const nextError = toError(reason); setError(nextError); throw nextError;
    } finally { setLoading(false); }
  }
  return { start, loading, error };
}

export function useCycle(id: string | undefined): Resource<CycleView | null> & {
  markActionDone(): Promise<void>;
  archive(): Promise<void>;
  restart(): Promise<string>;
  mutating: boolean;
} {
  const [data, setData] = useState<CycleView | null>(null);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const reload = useCallback(async () => {
    if (!id) { setData(null); setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const cycle = await cycleRepository.get(id);
      if (!cycle) { setData(null); return; }
      const seed = await contentRepository.getPublishedSeedById(cycle.seedId, cycle.seedContentVersion);
      if (!seed) throw new Error("The authored seed content for this cycle is unavailable.");
      setData(buildCycleView(cycle, seed));
    } catch (reason) { setError(toError(reason)); }
    finally { setLoading(false); }
  }, [id]);
  useEffect(() => { void reload(); }, [reload]);

  async function mutate(action: () => Promise<unknown>) {
    setMutating(true); setError(null);
    try { await action(); await reload(); }
    catch (reason) { setError(toError(reason)); throw reason; }
    finally { setMutating(false); }
  }

  return {
    data, loading, error, reload, mutating,
    markActionDone: async () => {
      if (!data) return;
      await mutate(async () => {
        await cycleRepository.markActionDone({ cycleId: data.cycle.id, stageId: data.stageId, occurredAt: new Date().toISOString(), clientEventId: Crypto.randomUUID() });
        await analyticsService.track("cycle_action_completed", { cycle_day: data.day, seed_slug: data.seed.slug }).catch(() => undefined);
      });
    },
    archive: async () => {
      if (!data) return;
      await mutate(() => cycleRepository.archive({ cycleId: data.cycle.id, occurredAt: new Date().toISOString(), clientEventId: Crypto.randomUUID() }));
    },
    restart: async () => {
      if (!data) throw new Error("Cycle not found.");
      let nextId = "";
      await mutate(async () => {
        const cycle = await cycleRepository.restart({ cycleId: data.cycle.id, startedAt: new Date().toISOString(), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, clientEventId: Crypto.randomUUID() });
        nextId = cycle.id;
        await notificationService.refreshCycle(cycle.id).catch(() => undefined);
      });
      return nextId;
    }
  };
}

function toError(reason: unknown): Error { return reason instanceof Error ? reason : new Error("Cycle data could not be loaded."); }
