import { randomUUID } from "expo-crypto";

import type { CyclePhotoStorage } from "@/src/ports/CyclePhotoStorage";
import { supabase } from "@/src/infrastructure/supabase/client";

export class SupabaseCyclePhotoStorage implements CyclePhotoStorage {
  async upload(userId: string, cycleId: string, fileName: string, body: ArrayBuffer, contentType: string): Promise<string> {
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${userId}/${cycleId}/${randomUUID()}-${safeName}`;
    const { error } = await supabase.storage.from("cycle-photos").upload(path, body, { contentType, upsert: false });
    if (error) throw error;
    return path;
  }

  async createSignedUrl(path: string, expiresInSeconds = 300): Promise<string> {
    const { data, error } = await supabase.storage.from("cycle-photos").createSignedUrl(path, expiresInSeconds);
    if (error) throw error;
    return data.signedUrl;
  }
}

export const cyclePhotoStorage = new SupabaseCyclePhotoStorage();
