import { describe, expect, it } from "vitest";

import { buildCycleView, toCycleDefinition } from "@/src/application/cycles/cycleView";
import { buildPhotoCheckContext, runPhotoCheck } from "@/src/application/photoChecks/runPhotoCheck";
import { applyCycleCommand, createCycle, TestClock } from "@/src/domain";
import type { PublishedSeed } from "@/src/domain/content";
import { harvestRecordSchema } from "@/src/domain/harvestRecord";
import { FixturePhotoCheckProvider } from "@/src/infrastructure/ai/FixturePhotoCheckProvider";

const seed: PublishedSeed = {
  id: "10000000-0000-4000-8000-000000000001", slug: "cress", commonName: "Cress", botanicalName: "Lepidium sativum", description: "Fast first grow", expectedResult: "Green cress", contentVersion: 1,
  durationDaysMin: 7, durationDaysMax: 14, difficulty: "Easy", environmentSummary: "Indoor", lightSummary: "Bright", accessType: "free", images: [{ kind: "bundled", key: "cress" }], reviewStatus: "draft",
  harvestMode: "single", materials: ["tray"], harvestInstructions: "Cut cleanly", harvestReadiness: "Green and upright", storageGuidance: "Use promptly", tasteProfile: "Peppery",
  stages: [
    { id: "40000000-0000-4000-8000-000000000001", stage: "setup", phase: "setup", position: 1, startDay: 1, endDay: 1, nextAction: "Sow", actionIntervalDays: 1, guidance: "Sow evenly", observationPrompt: "Is it damp?", whatIsHappening: "Hydration", milestone: "Sown", whatGoodLooksLike: "Evenly moist", commonProblems: [], photoCheckPrompt: null, harvestReady: false, harvestCriteria: null },
    { id: "40000000-0000-4000-8000-000000000002", stage: "growth", phase: "growth", position: 2, startDay: 2, endDay: 12, nextAction: "Check moisture", actionIntervalDays: 1, guidance: "Keep damp", observationPrompt: "Are shoots upright?", whatIsHappening: "Growth", milestone: "Green", whatGoodLooksLike: "Green upright shoots", commonProblems: ["Low light", "Excess moisture"], photoCheckPrompt: "Compare the stems and leaves with healthy growth.", harvestReady: false, harvestCriteria: null },
    { id: "40000000-0000-4000-8000-000000000003", stage: "harvest", phase: "harvest", position: 3, startDay: 13, endDay: 14, nextAction: "Harvest", actionIntervalDays: 1, guidance: "Cut cleanly", observationPrompt: "Ready?", whatIsHappening: "Ready", milestone: "Harvest", whatGoodLooksLike: "Open green seed leaves", commonProblems: [], photoCheckPrompt: "Assess harvest readiness.", harvestReady: true, harvestCriteria: {} }
  ]
};

describe("Stage 6 release regression", () => {
  it("keeps the complete Cress journey coherent from start through check and private harvest history", async () => {
    const cycle = createCycle({ id: "20000000-0000-4000-8000-000000000001", seedId: seed.id, seedContentVersion: 1, startedAt: "2026-08-01T09:00:00.000Z", timezone: "Europe/London" });
    const firstDay = buildCycleView(cycle, seed, new TestClock("2026-08-01T10:00:00.000Z"));
    expect(firstDay).toMatchObject({ day: 1, phase: "setup", nextAction: "Sow", actionDue: true });

    const growth = buildCycleView(cycle, seed, new TestClock("2026-08-05T10:00:00.000Z"));
    const photoCheck = await runPhotoCheck({
      requestId: "30000000-0000-4000-8000-000000000001",
      fixtureId: "AI-001",
      checkType: "progress",
      storagePath: "user/cycle/check.jpg",
      context: buildPhotoCheckContext(growth, "bright"),
      provider: new FixturePhotoCheckProvider()
    });
    expect(photoCheck.result).toMatchObject({ status: "on_track", confidence: "high" });

    const harvestDay = buildCycleView(cycle, seed, new TestClock("2026-08-13T10:00:00.000Z"));
    expect(harvestDay).toMatchObject({ day: 13, phase: "harvest", status: "harvest_ready", priority: "harvest_ready" });
    const definition = toCycleDefinition(seed);
    const ready = applyCycleCommand(cycle, definition, "mark_harvest_ready", "2026-08-13T10:00:00.000Z", true);
    const harvested = applyCycleCommand(ready, definition, "mark_harvested", "2026-08-13T10:05:00.000Z", true);
    expect(harvested).toMatchObject({ status: "harvested", harvestCount: 1 });

    expect(harvestRecordSchema.parse({
      id: "50000000-0000-4000-8000-000000000001", cycleId: cycle.id, userId: "60000000-0000-4000-8000-000000000001", seedId: seed.id,
      harvestNumber: 1, harvestedAt: harvested.harvestedAt, storagePath: null, suggestions: null, suggestionStatus: "fallback", promptVersion: null, modelVersion: null, costEstimate: 0, latencyMs: 0
    })).toMatchObject({ harvestNumber: 1, storagePath: null, suggestionStatus: "fallback" });
  });
});
