import * as Crypto from "expo-crypto";
import { useCallback, useEffect, useState } from "react";

import { buildCycleView, prioritizeCycleViews, type CycleView } from "@/src/application/cycles/cycleView";
import { contentRepository } from "@/src/infrastructure/repositories/SupabaseContentRepository";
import { cycleRepository } from "@/src/infrastructure/repositories/SupabaseCycleRepository";

interface Resource<T> {
  data: T;
  loading: boolean;
  error: Error | null;
  reload(): Promise<void>;
}

async function hydrateCycles(activeOnly: boolean): Promise<readonly CycleView[]> {
  const cycles = activeOnly ? await cycleRepository.getActive() : await cycleRepository.getAll();
  const views = await Promise.all(cycles.map(async (cycle) => {
    const seed = await contentRepository.getPublishedSeedById(cycle.seedId);
    if (!seed) throw new Error("The authored seed content for this cycle is unavailable.");
    return buildCycleView(cycle, seed);
  }));
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
      const seed = await contentRepository.getPublishedSeedById(cycle.seedId);
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
      await mutate(() => cycleRepository.markActionDone({ cycleId: data.cycle.id, stageId: data.stageId, occurredAt: new Date().toISOString(), clientEventId: Crypto.randomUUID() }));
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
      });
      return nextId;
    }
  };
}

function toError(reason: unknown): Error { return reason instanceof Error ? reason : new Error("Cycle data could not be loaded."); }
