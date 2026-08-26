import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { applyCycleCommand } from "@/src/domain/harvest";
import { harvestRecordSchema, harvestSuggestionsSchema } from "@/src/domain/harvestRecord";
import { calculateGardenCardWidth } from "@/src/presentation/harvest/galleryLayout";
import { toNotificationPreferencesError } from "@/src/presentation/notifications/notificationErrors";

const root = process.cwd();
const migration = ["202608260011_stage9_harvest_notifications.sql", "202608260012_stage9_harvest_readiness_repair.sql", "202608260013_stage9_repair_dangling_harvest_photos.sql", "202608260014_stage9_attach_recovered_harvest_photo.sql"].map((name) => readFileSync(join(root, "supabase/migrations", name), "utf8")).join("\n");
const edge = readFileSync(join(root, "supabase/functions/harvest-suggestions/index.ts"), "utf8");
const notificationProvider = readFileSync(join(root, "src/presentation/notifications/NotificationProvider.tsx"), "utf8");
const harvestResultScreen = readFileSync(join(root, "app/harvest/[id].tsx"), "utf8");

describe("Stage 9 notification platform safety", () => {
  it("does not call native notification-response APIs on web", () => {
    expect(notificationProvider).toContain('if (Platform.OS === "web") return;');
    expect(notificationProvider).toContain("getLastNotificationResponseAsync()\n      .then");
  });
});

describe("Stage 9 harvest records", () => {
  it("shows an honest bounded state when a harvest has no photo", () => {
    expect(harvestResultScreen).toContain("No harvest photo added");
    expect(harvestResultScreen).not.toContain("resolveSeedImage");
    expect(harvestResultScreen).toContain("height: 240");
  });

  it("accepts only 3 to 5 concise post-harvest ideas", () => {
    expect(harvestSuggestionsSchema.safeParse({ headline: "Fresh cress, ready to enjoy", ideas: [
      { title: "Top a soup", description: "Scatter it over the bowl just before serving." },
      { title: "Lift a sandwich", description: "Add a fresh handful after the other fillings." },
      { title: "Finish a salad", description: "Toss it through at the last moment." }
    ] }).success).toBe(true);
    expect(harvestSuggestionsSchema.safeParse({ headline: "Too short", ideas: [] }).success).toBe(false);
  });

  it("validates a private harvest record", () => {
    expect(harvestRecordSchema.parse({ id: "73af2ba1-c4b8-4c85-a12e-171ae7b5ed98", cycleId: "a4205eef-262e-49ca-b67f-19f4507cf821", userId: "94941f38-681a-4639-9815-96ac7f3991dd", seedId: "663df460-0ac3-4308-973e-75c61685eaa8", harvestNumber: 1, harvestedAt: "2026-08-26T10:00:00.000Z", storagePath: null, suggestions: null, suggestionStatus: "pending", promptVersion: null, modelVersion: null, costEstimate: 0, latencyMs: 0 }).harvestNumber).toBe(1);
  });

  it("accepts PostgreSQL timestamps with an explicit timezone offset", () => {
    const result = harvestRecordSchema.safeParse({ id: "73af2ba1-c4b8-4c85-a12e-171ae7b5ed98", cycleId: "a4205eef-262e-49ca-b67f-19f4507cf821", userId: "94941f38-681a-4639-9815-96ac7f3991dd", seedId: "663df460-0ac3-4308-973e-75c61685eaa8", harvestNumber: 1, harvestedAt: "2026-08-26T15:28:00+00:00", storagePath: null, suggestions: null, suggestionStatus: "pending", promptVersion: null, modelVersion: null, costEstimate: 0, latencyMs: 0 });
    expect(result.success).toBe(true);
  });

  it("keeps repeating harvest cycles active", () => {
    const state = { id: "cycle", seedId: "seed", seedContentVersion: 1, status: "harvest_ready" as const, startedAt: "2026-08-20T10:00:00.000Z", timezone: "Europe/London", currentStageId: null, lastActionAt: null, harvestCount: 0, harvestedAt: null, lastHarvestedAt: null };
    const definition = { seedId: "seed", contentVersion: 1, harvestMode: "repeating" as const, stages: [{ id: "harvest", phase: "harvest" as const, dayFrom: 1, dayTo: null, nextActionId: "cut", actionIntervalDays: 1, harvestReady: true }] };
    expect(applyCycleCommand(state, definition, "mark_harvested", "2026-08-26T10:00:00.000Z", true).status).toBe("active");
  });
});

describe("Stage 9 database boundaries", () => {
  it("makes harvest completion atomic, owned and idempotent", () => {
    expect(migration).toContain("for update");
    expect(migration).toContain("user_id = auth.uid()");
    expect(migration).toContain("client_event_id = p_client_event_id");
    expect(migration).toContain("'harvest_completed'");
    expect(migration).toContain("cycle is not harvest ready");
    expect(migration).toContain("authored_stage.harvest_ready is false");
  });

  it("keeps harvest photos private and suggestions server-side", () => {
    expect(migration).toContain('create policy "harvests select own rows"');
    expect(migration).toContain("invalid harvest photo path");
    expect(migration).toContain("function public.attach_harvest_photo");
    expect(edge).toContain('required("OPENAI_API_KEY")');
    expect(edge).toContain("Never return full recipes");
    expect(edge).toContain("store: false");
  });

  it("schedules only cycle actions, respects quiet hours and stores a deep link", () => {
    expect(migration).toContain("next_allowed_notification_time");
    expect(migration).toContain("notification_prefs");
    expect(migration).toContain("current_stage.next_action");
    expect(migration).toContain("'/cycle/' || owned_cycle.id::text");
    expect(migration).toContain("seednergy-dispatch-notifications");
  });
});

describe("Stage 9 presentation safeguards", () => {
  it("keeps a two-column Garden grid within its measured container", () => {
    expect(calculateGardenCardWidth(320, 16)).toBe(152);
    expect(calculateGardenCardWidth(0, 16)).toBe(0);
  });

  it("turns a missing Android Firebase setup into an actionable message", () => {
    const error = toNotificationPreferencesError(new Error("Default FirebaseApp is not initialized in this process com.seednergy.app"));
    expect(error.message).toContain("new Firebase-enabled Seednergy build");
  });
});
