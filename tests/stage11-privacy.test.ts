import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { collectStoragePaths, type StorageEntry } from "@/supabase/functions/delete-account/storage";

const root = process.cwd();
const migration = readFileSync(join(root, "supabase/migrations/202608260015_stage11_privacy_compliance.sql"), "utf8");
const deletionFunction = readFileSync(join(root, "supabase/functions/delete-account/index.ts"), "utf8");
const retentionFunction = readFileSync(join(root, "supabase/functions/photo-retention/index.ts"), "utf8");
const photoCheckFunction = readFileSync(join(root, "supabase/functions/photo-check/index.ts"), "utf8");

describe("Stage 11 account deletion", () => {
  it("removes and verifies every private storage object before deleting database and Auth records", () => {
    expect(deletionFunction).toContain("listFilesRecursively");
    expect(deletionFunction).toContain(".remove(paths.slice");
    expect(deletionFunction).toContain("if (remaining.length > 0)");
    expect(deletionFunction.indexOf('rpc("finalize_account_deletion"')).toBeGreaterThan(deletionFunction.indexOf("if (remaining.length > 0)"));
    expect(deletionFunction.indexOf("auth.admin.deleteUser")).toBeGreaterThan(deletionFunction.indexOf('rpc("finalize_account_deletion"'));
  });

  it("walks nested cycle folders and every page so no owned photo path is missed", async () => {
    const pages = new Map<string, StorageEntry[]>([
      ["user:0", [{ id: null, name: "cycle-a" }, ...Array.from({ length: 99 }, (_, index) => ({ id: `root-${index}`, name: `root-${index}.jpg` }))]],
      ["user:100", [{ id: "root-last", name: "root-last.jpg" }]],
      ["user/cycle-a:0", [{ id: null, name: "check" }, { id: null, name: "harvest" }]],
      ["user/cycle-a/check:0", [{ id: "check-1", name: "check-1.jpg" }]],
      ["user/cycle-a/harvest:0", [{ id: "harvest-1", name: "harvest-1.jpg" }]]
    ]);
    const paths = await collectStoragePaths("user", async (prefix, offset) => pages.get(`${prefix}:${offset}`) ?? []);
    expect(paths).toHaveLength(102);
    expect(paths).toContain("user/cycle-a/check/check-1.jpg");
    expect(paths).toContain("user/cycle-a/harvest/harvest-1.jpg");
    expect(paths).toContain("user/root-last.jpg");
  });

  it("deletes all account-owned database records in an idempotent ordered function", () => {
    for (const table of ["notifications", "push_devices", "entitlements", "ai_request_logs", "photo_checks", "harvests", "analytics_events", "cycle_events", "cycles", "profiles"]) {
      expect(migration).toContain(`delete from public.${table}`);
    }
    expect(migration).toContain("current_setting('seednergy.account_deletion', true)");
    expect(migration).toContain("auth.role() <> 'service_role'");
  });
});

describe("Stage 11 retention and AI notice", () => {
  it("keeps retention disabled until the open legal decision is approved", () => {
    expect(migration).toContain("values (true, null)");
    expect(retentionFunction).toContain("skipped_unconfigured");
    expect(retentionFunction).toContain('from("photo_checks")');
    expect(retentionFunction).not.toContain('from("harvests").delete');
  });

  it("enforces the first-photo notice on the server", () => {
    expect(migration).toContain("ai_photo_notice_accepted_at");
    expect(migration).toContain("accept_ai_photo_notice");
    expect(photoCheckFunction).toContain("ai_photo_notice_required");
    expect(photoCheckFunction).toContain("ai_photo_notice_accepted_at");
  });

  it("accepts only an explicit analytics allowlist without email or photo properties", () => {
    expect(migration).toContain("unsupported analytics event");
    expect(migration).toContain("unsupported analytics property");
    expect(migration).not.toContain("'email','photo'");
  });
});
