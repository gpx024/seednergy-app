import { photoCheckResultSchema } from "@/src/domain/photoCheck";
import { supabase } from "@/src/infrastructure/supabase/client";
import type { PhotoCheckProvider, PhotoCheckProviderInput } from "@/src/ports/PhotoCheckProvider";

export class SupabasePhotoCheckProvider implements PhotoCheckProvider {
  async check(input: PhotoCheckProviderInput) {
    const { data, error } = await supabase.functions.invoke("photo-check", {
      body: {
        requestId: input.requestId,
        cycleId: input.context.cycleId,
        checkType: input.checkType,
        storagePath: input.storagePath
      }
    });

    if (error) throw new Error(await functionErrorMessage(error));
    const envelope = parseEnvelope(data);
    return { result: photoCheckResultSchema.parse(envelope.result), persistedCheckId: envelope.checkId };
  }
}

function parseEnvelope(value: unknown): { result: unknown; checkId: string } {
  if (typeof value === "object" && value !== null && "result" in value && "checkId" in value && typeof value.checkId === "string") return value as { result: unknown; checkId: string };
  throw new Error("The photo-check service returned an invalid response.");
}

async function functionErrorMessage(error: unknown): Promise<string> {
  const fallback = error instanceof Error ? error.message : "The photo check could not be completed.";
  const context = typeof error === "object" && error !== null && "context" in error ? (error as { context?: unknown }).context : null;
  if (!(context instanceof Response)) return fallback;
  try {
    const body = await context.clone().json() as { error?: string; message?: string };
    return body.message ?? body.error ?? fallback;
  } catch {
    return fallback;
  }
}

export const supabasePhotoCheckProvider = new SupabasePhotoCheckProvider();
