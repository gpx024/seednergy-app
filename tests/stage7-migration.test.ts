import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(join(process.cwd(), "supabase", "migrations", "202608250008_stage7_photo_checks.sql"), "utf8").toLowerCase();
const storage = readFileSync(join(process.cwd(), "src", "infrastructure", "storage", "SupabaseCyclePhotoStorage.ts"), "utf8");

describe("Stage 7 persistence and privacy", () => {
  it.each(["progress", "issue", "stage_review", "harvest_readiness", "follow_up"])("seeds %s check type", (type) => expect(migration).toContain(`'${type}'`));
  it("saves a check and cycle event atomically behind authentication", () => {
    expect(migration).toContain("function public.save_photo_check");
    expect(migration).toContain("auth.uid()");
    expect(migration).toContain("'photo_check_completed'");
    expect(migration).toContain("grant execute");
  });
  it("derives quota consumption server-side and excludes failed analyses", () => {
    expect(migration).toContain("not in ('unclear','rejected','provider_error')");
    expect(migration).not.toContain("p_quota_consumed");
  });
  it("enforces a user-owned private storage path", () => expect(migration).toContain("split_part(p_storage_path, '/', 1) <> auth.uid()::text"));
  it("uploads via a signed upload URL", () => {
    expect(storage).toContain("createSignedUploadUrl");
    expect(storage).toContain("uploadToSignedUrl");
  });
  it("does not invent a retention duration while policy remains open", () => {
    expect(migration).toContain("retention_expires_at, client_event_id");
    expect(migration).toContain("p_result, consumes_quota, null, p_client_event_id");
  });
});
