import { photoCheckConfidenceSchema, photoCheckResultSchema, photoCheckStatusSchema, photoCheckTypeSchema } from "@/src/domain/photoCheck";
import { supabase } from "@/src/infrastructure/supabase/client";
import type { Json, PhotoCheckRow } from "@/src/infrastructure/supabase/database.types";
import type { PhotoCheckRecord, PhotoCheckRepository, SavePhotoCheckInput } from "@/src/ports/PhotoCheckRepository";

const columns = "id,cycle_id,check_type,storage_path,submitted_at,status,confidence,result,quota_consumed,retention_expires_at,error_code,check_types(slug)";

export class SupabasePhotoCheckRepository implements PhotoCheckRepository {
  async get(id: string): Promise<PhotoCheckRecord | null> {
    const { data, error } = await supabase.from("photo_checks").select(columns).eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? mapRecord(data as unknown as PhotoCheckQueryRow) : null;
  }

  async getHistory(cycleId: string): Promise<readonly PhotoCheckRecord[]> {
    const { data, error } = await supabase.from("photo_checks").select(columns).eq("cycle_id", cycleId).order("submitted_at", { ascending: false });
    if (error) throw error;
    return (data as unknown as PhotoCheckQueryRow[]).map(mapRecord);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.get(id);
    if (!existing) return;
    if (existing.storagePath) {
      const { error: storageError } = await supabase.storage.from("cycle-photos").remove([existing.storagePath]);
      if (storageError) throw storageError;
    }
    const { error } = await supabase.rpc("delete_photo_check", { p_photo_check_id: id });
    if (error) throw error;
  }

  async save(input: SavePhotoCheckInput): Promise<PhotoCheckRecord> {
    const { data, error } = await supabase.rpc("save_photo_check", {
      p_cycle_id: input.cycleId,
      p_check_type: input.checkType,
      p_storage_path: input.storagePath,
      p_result: input.result as unknown as Json,
      p_occurred_at: input.occurredAt,
      p_client_event_id: input.clientEventId
    });
    if (error) throw error;
    const row = data as PhotoCheckRow;
    return {
      id: row.id,
      cycleId: row.cycle_id,
      checkType: input.checkType,
      storagePath: row.storage_path,
      submittedAt: row.submitted_at,
      status: photoCheckStatusSchema.parse(row.status),
      confidence: photoCheckConfidenceSchema.parse(row.confidence),
      result: photoCheckResultSchema.parse(row.result),
      quotaConsumed: row.quota_consumed,
      retentionExpiresAt: row.retention_expires_at,
      errorCode: row.error_code
    };
  }
}

type PhotoCheckQueryRow = Omit<PhotoCheckRow, "check_type"> & { check_type: string | null; check_types: { slug: string } | null };

function mapRecord(row: PhotoCheckQueryRow): PhotoCheckRecord {
  return {
    id: row.id,
    cycleId: row.cycle_id,
    checkType: photoCheckTypeSchema.parse(row.check_types?.slug),
    storagePath: row.storage_path,
    submittedAt: row.submitted_at,
    status: photoCheckStatusSchema.parse(row.status),
    confidence: photoCheckConfidenceSchema.parse(row.confidence),
    result: photoCheckResultSchema.parse(row.result),
    quotaConsumed: row.quota_consumed,
    retentionExpiresAt: row.retention_expires_at,
    errorCode: row.error_code
  };
}

export const photoCheckRepository = new SupabasePhotoCheckRepository();
