import * as Crypto from "expo-crypto";
import { useCallback, useEffect, useState } from "react";

import type { HarvestRecord } from "@/src/domain";
import type { PublishedSeed } from "@/src/domain/content";
import { contentRepository } from "@/src/infrastructure/repositories/SupabaseContentRepository";
import { harvestRepository } from "@/src/infrastructure/repositories/SupabaseHarvestRepository";
import { cyclePhotoStorage } from "@/src/infrastructure/storage/SupabaseCyclePhotoStorage";
import type { CapturedPhoto } from "@/src/presentation/photoChecks/usePhotoChecks";
import { validateCapturedPhoto } from "@/src/presentation/photoChecks/usePhotoChecks";

export interface HarvestView {
  record: HarvestRecord;
  seed: PublishedSeed;
  photoUrl: string | null;
}

export function useCompleteHarvest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function complete(input: { userId: string; cycleId: string; photo: CapturedPhoto | null }): Promise<HarvestRecord> {
    setLoading(true); setError(null);
    let storagePath: string | null = null;
    try {
      if (input.photo) {
        validateCapturedPhoto(input.photo);
        const response = await fetch(input.photo.uri);
        if (!response.ok) throw new Error("The selected harvest photo could not be read.");
        const bytes = await response.arrayBuffer();
        storagePath = await cyclePhotoStorage.uploadHarvest(input.userId, input.cycleId, input.photo.fileName, bytes, input.photo.contentType);
      }
      let record: HarvestRecord;
      try {
        record = await harvestRepository.complete({ cycleId: input.cycleId, harvestedAt: new Date().toISOString(), storagePath, clientEventId: Crypto.randomUUID() });
      } catch (completionError) {
        const existing = await harvestRepository.getLatestForCycle(input.cycleId).catch(() => null);
        if (!existing) {
          if (storagePath) await cyclePhotoStorage.remove(storagePath).catch(() => undefined);
          throw completionError;
        }
        if (storagePath && !existing.storagePath) record = await harvestRepository.attachPhoto(existing.id, storagePath);
        else {
          if (storagePath && existing.storagePath !== storagePath) await cyclePhotoStorage.remove(storagePath).catch(() => undefined);
          record = existing;
        }
      }
      try { return await harvestRepository.requestSuggestions(record.id); }
      catch { return record; }
    } catch (reason) {
      const nextError = toError(reason); setError(nextError); throw nextError;
    } finally { setLoading(false); }
  }

  return { complete, loading, error, clearError: () => setError(null) };
}

export function useHarvest(id: string | undefined) {
  const [data, setData] = useState<HarvestView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const reload = useCallback(async () => {
    if (!id) { setData(null); setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      let record = await harvestRepository.get(id);
      if (!record) { setData(null); return; }
      if (record.suggestionStatus === "pending") record = await harvestRepository.requestSuggestions(record.id).catch(() => record as HarvestRecord);
      setData(await hydrate(record));
    } catch (reason) { setError(toError(reason)); }
    finally { setLoading(false); }
  }, [id]);
  useEffect(() => { void reload(); }, [reload]);
  return { data, loading, error, reload };
}

export function useHarvestGallery() {
  const [data, setData] = useState<readonly HarvestView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const reload = useCallback(async () => {
    setLoading(true); setError(null);
    try { setData(await Promise.all((await harvestRepository.getAll()).map(hydrate))); }
    catch (reason) { setError(toError(reason)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void reload(); }, [reload]);
  return { data, loading, error, reload };
}

async function hydrate(record: HarvestRecord): Promise<HarvestView> {
  const seed = await contentRepository.getPublishedSeedById(record.seedId);
  if (!seed) throw new Error("The seed content for this harvest is unavailable.");
  const photoUrl = record.storagePath ? await cyclePhotoStorage.createSignedUrl(record.storagePath, 3600) : null;
  return { record, seed, photoUrl };
}

function toError(reason: unknown): Error { return reason instanceof Error ? reason : new Error("Harvest data could not be loaded."); }
