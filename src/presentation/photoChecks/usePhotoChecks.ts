import * as Crypto from "expo-crypto";
import { useCallback, useEffect, useState } from "react";

import { buildPhotoCheckContext, runPhotoCheck } from "@/src/application/photoChecks/runPhotoCheck";
import { featureFlags } from "@/src/config/features";
import type { PhotoCheckType } from "@/src/domain/photoCheck";
import { fixturePhotoCheckProvider } from "@/src/infrastructure/ai/FixturePhotoCheckProvider";
import { photoCheckFixtureIds } from "@/src/infrastructure/ai/photoCheckFixtures";
import { supabasePhotoCheckProvider } from "@/src/infrastructure/ai/SupabasePhotoCheckProvider";
import { photoCheckRepository } from "@/src/infrastructure/repositories/SupabasePhotoCheckRepository";
import { cyclePhotoStorage } from "@/src/infrastructure/storage/SupabaseCyclePhotoStorage";
import type { PhotoCheckRecord } from "@/src/ports/PhotoCheckRepository";
import type { CycleView } from "@/src/application/cycles/cycleView";

export type { PhotoCheckType } from "@/src/domain/photoCheck";
export const developmentPhotoCheckFixtureIds = photoCheckFixtureIds;

export interface CapturedPhoto {
  uri: string;
  fileName: string;
  contentType: "image/jpeg" | "image/png" | "image/webp";
  fileSize: number | null;
}

export function validateCapturedPhoto(photo: CapturedPhoto): void {
  if (!photo.uri) throw new Error("Choose a photo before continuing.");
  if (!(["image/jpeg", "image/png", "image/webp"] as const).includes(photo.contentType)) throw new Error("Use a JPEG, PNG, or WebP image.");
  if (photo.fileSize !== null && photo.fileSize > 10 * 1024 * 1024) throw new Error("The photo must be smaller than 10 MB.");
}

export function useSubmitPhotoCheck() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function submit(input: { userId: string; cycle: CycleView; lightCondition: string | null; photo: CapturedPhoto; checkType: PhotoCheckType; fixtureId: string }): Promise<string> {
    validateCapturedPhoto(input.photo);
    setLoading(true); setError(null);
    try {
      const response = await fetch(input.photo.uri);
      if (!response.ok) throw new Error("The selected photo could not be read.");
      const body = await response.arrayBuffer();
      if (body.byteLength > 10 * 1024 * 1024) throw new Error("The photo must be smaller than 10 MB.");
      const storagePath = await cyclePhotoStorage.upload(input.userId, input.cycle.cycle.id, input.photo.fileName, body, input.photo.contentType);
      const context = buildPhotoCheckContext(input.cycle, input.lightCondition);
      const requestId = Crypto.randomUUID();
      const provider = featureFlags.fixturePhotoChecks ? fixturePhotoCheckProvider : supabasePhotoCheckProvider;
      const execution = await runPhotoCheck({ requestId, fixtureId: featureFlags.fixturePhotoChecks ? input.fixtureId : undefined, checkType: input.checkType, storagePath, context, provider });
      if (execution.persistedCheckId) return execution.persistedCheckId;
      const record = await photoCheckRepository.save({ cycleId: input.cycle.cycle.id, checkType: input.checkType, storagePath, result: execution.result, occurredAt: new Date().toISOString(), clientEventId: requestId });
      return record.id;
    } catch (reason) {
      const nextError = toError(reason); setError(nextError); throw nextError;
    } finally { setLoading(false); }
  }

  return { submit, loading, error, clearError: () => setError(null) };
}

export function usePhotoCheck(id: string | undefined) {
  const [data, setData] = useState<PhotoCheckRecord | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const reload = useCallback(async () => {
    if (!id) { setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const record = await photoCheckRepository.get(id);
      setData(record);
      setPhotoUrl(record ? await cyclePhotoStorage.createSignedUrl(record.storagePath) : null);
    } catch (reason) { setError(toError(reason)); }
    finally { setLoading(false); }
  }, [id]);
  useEffect(() => { void reload(); }, [reload]);
  return { data, photoUrl, loading, error, reload };
}

export function usePhotoCheckHistory(cycleId: string | undefined) {
  const [data, setData] = useState<readonly PhotoCheckRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const reload = useCallback(async () => {
    if (!cycleId) { setLoading(false); return; }
    setLoading(true); setError(null);
    try { setData(await photoCheckRepository.getHistory(cycleId)); }
    catch (reason) { setError(toError(reason)); }
    finally { setLoading(false); }
  }, [cycleId]);
  useEffect(() => { void reload(); }, [reload]);
  return { data, loading, error, reload };
}

function toError(reason: unknown): Error { return reason instanceof Error ? reason : new Error("The photo check could not be completed."); }
