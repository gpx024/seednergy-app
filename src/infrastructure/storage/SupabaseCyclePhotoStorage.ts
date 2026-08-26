import { randomUUID } from "expo-crypto";

import type { CyclePhotoStorage } from "@/src/ports/CyclePhotoStorage";
import { supabase } from "@/src/infrastructure/supabase/client";

export class SupabaseCyclePhotoStorage implements CyclePhotoStorage {
  async upload(userId: string, cycleId: string, fileName: string, body: ArrayBuffer, contentType: string): Promise<string> {
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${userId}/${cycleId}/${randomUUID()}-${safeName}`;
    const bucket = supabase.storage.from("cycle-photos");
    const signed = await bucket.createSignedUploadUrl(path);
    if (signed.error) throw signed.error;
    const uploaded = await bucket.uploadToSignedUrl(path, signed.data.token, body, { contentType });
    if (uploaded.error) throw uploaded.error;
    return path;
  }

  async uploadHarvest(userId: string, cycleId: string, fileName: string, body: ArrayBuffer, contentType: string): Promise<string> {
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${userId}/${cycleId}/harvest/${randomUUID()}-${safeName}`;
    const bucket = supabase.storage.from("cycle-photos");
    const signed = await bucket.createSignedUploadUrl(path);
    if (signed.error) throw signed.error;
    const uploaded = await bucket.uploadToSignedUrl(path, signed.data.token, body, { contentType });
    if (uploaded.error) throw uploaded.error;
    return path;
  }

  async createSignedUrl(path: string, expiresInSeconds = 300): Promise<string> {
    const { data, error } = await supabase.storage.from("cycle-photos").createSignedUrl(path, expiresInSeconds);
    if (error) throw error;
    return data.signedUrl;
  }


  async remove(path: string): Promise<void> {
    const { error } = await supabase.storage.from("cycle-photos").remove([path]);
    if (error) throw error;
  }
}

export const cyclePhotoStorage = new SupabaseCyclePhotoStorage();
