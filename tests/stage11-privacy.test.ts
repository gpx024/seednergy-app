import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { collectStoragePaths, type StorageEntry } from "@/supabase/functions/delete-account/storage";
import { redactSensitiveString, sanitizeMonitoringEvent } from "@/src/infrastructure/monitoring/privacy";

const root = process.cwd();
const migration = readFileSync(join(root, "supabase/migrations/202608260015_stage11_privacy_compliance.sql"), "utf8");
const deletionFunction = readFileSync(join(root, "supabase/functions/delete-account/index.ts"), "utf8");
const retentionFunction = readFileSync(join(root, "supabase/functions/photo-retention/index.ts"), "utf8");
const photoCheckFunction = readFileSync(join(root, "supabase/functions/photo-check/index.ts"), "utf8");
const monitoringAdapter = readFileSync(join(root, "src/infrastructure/monitoring/sentry.ts"), "utf8");
const rootLayout = readFileSync(join(root, "app/_layout.tsx"), "utf8");
const appConfig = JSON.parse(readFileSync(join(root, "app.json"), "utf8"));
const deletionAuditMigration = readFileSync(join(root, "supabase/migrations/202608290019_stage11_deletion_audits.sql"), "utf8");
const monitoringVerificationScreen = readFileSync(join(root, "app/settings/monitoring-verification.tsx"), "utf8");
const operationalFunctionNames = ["delete-account", "photo-check", "harvest-suggestions", "photo-retention"];
const retentionPolicyMigration = readFileSync(join(root, "supabase/migrations/202608290020_stage11_retention_policy.sql"), "utf8");
const photoErasureMigration = readFileSync(join(root, "supabase/migrations/202608290021_stage11_user_photo_erasure.sql"), "utf8");

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

  it("records anonymous deletion proof without user identifiers or object paths", () => {
    expect(deletionAuditMigration).toContain("account_deletion_audits");
    expect(deletionAuditMigration).toContain("storage_verified_empty");
    expect(deletionAuditMigration).not.toMatch(/user_id\s+uuid|email\s+text|storage_path\s+text|token\s+text/);
    expect(deletionFunction).toContain("auditId");
    expect(deletionFunction).toContain("storageVerifiedEmpty: true");
  });
});

describe("Stage 11 retention and AI notice", () => {
  it("fails safely when retention has not yet been configured", () => {
    expect(migration).toContain("values (true, null)");
    expect(retentionFunction).toContain("skipped_unconfigured");
    expect(retentionFunction).toContain('from("photo_checks")');
    expect(retentionFunction).not.toContain('from("harvests").delete');
    expect(retentionFunction).toContain('status: "dry_run"');
    expect(retentionFunction).toContain("deletedRecords: 0, deletedObjects: 0");
  });

  it("applies the approved 90-day image policy and schedules daily cleanup", () => {
    expect(retentionPolicyMigration).toContain("check_photo_retention_days = 90");
    expect(retentionPolicyMigration).toContain("seednergy-photo-retention-daily");
    expect(retentionPolicyMigration).toContain("photo_retention_job_secret");
    expect(retentionFunction).toContain("update({ storage_path: null })");
  });

  it("supports user-initiated deletion of checks and harvest photos", () => {
    expect(photoErasureMigration).toContain("remove_harvest_photo");
    expect(photoErasureMigration).toContain("delete_photo_check");
    expect(photoErasureMigration).toContain("user_id = auth.uid()");
  });

  it("keeps Sentry privacy-safe and initialized only through the monitoring adapter", () => {
    expect(monitoringAdapter).toContain("sendDefaultPii: false");
    expect(monitoringAdapter).toContain("tracesSampleRate: 0");
    expect(rootLayout).not.toContain("Sentry.init");
    expect(rootLayout).not.toContain("Sentry.wrap(withMonitoring");
    expect(appConfig.expo.plugins).toContainEqual([
      "@sentry/react-native/expo",
      expect.objectContaining({ organization: "seednergy", project: "seednergy-app" })
    ]);
    expect(monitoringVerificationScreen).toContain("featureFlags.monitoringVerification");
  });

  it("redacts user, request, secret and photo payloads from monitoring events", () => {
    const event = sanitizeMonitoringEvent({
      user: { id: "private-user" },
      request: { url: "https://example.test?token=secret" },
      extra: { photo: "data:image/jpeg;base64,AAAA" },
      message: "hello@example.com Bearer abc.def.ghi",
      contexts: { operation: { password: "secret", note: "safe" } }
    });
    expect(event).not.toHaveProperty("user");
    expect(event).not.toHaveProperty("request");
    expect(event).not.toHaveProperty("extra");
    expect(event.message).toBe("[redacted-email] Bearer [redacted]");
    expect(event.contexts.operation.password).toBe("[redacted]");
    expect(redactSensitiveString("content://photos/private.jpg")).toBe("[redacted-photo]");
  });

  it("keeps sensitive payload fields out of operational logs", () => {
    const logStatements = operationalFunctionNames.flatMap((name) => readFileSync(join(root, "supabase/functions", name, "index.ts"), "utf8").split("\n").filter((line) => line.includes("console."))).join("\n");
    expect(logStatements).not.toMatch(/authorization|serviceRole|password|email|storagePath|storage_path|photoUri|photo_url|imageBase64|error\.message/i);
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
