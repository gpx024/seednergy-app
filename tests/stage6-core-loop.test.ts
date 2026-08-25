import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { buildCycleView, prioritizeCycleViews } from "@/src/application/cycles/cycleView";
import { defaultOnboardingAnswers, explainCressRecommendation } from "@/src/application/onboarding/recommendation";
import { TestClock, type CycleState } from "@/src/domain";
import type { PublishedSeed } from "@/src/domain/content";

const seed: PublishedSeed = {
  id: "10000000-0000-4000-8000-000000000001", slug: "cress", commonName: "Cress", botanicalName: "Lepidium sativum", description: "Fast first grow", expectedResult: "Green cress", contentVersion: 1,
  durationDaysMin: 7, durationDaysMax: 14, difficulty: "Easy", environmentSummary: "Indoor", lightSummary: "Bright", accessType: "free", images: [{ kind: "bundled", key: "cress" }], reviewStatus: "draft",
  harvestMode: "single", materials: ["tray"], harvestInstructions: "Cut", harvestReadiness: "Green", storageGuidance: "Chill", tasteProfile: "Peppery",
  stages: [
    { id: "40000000-0000-4000-8000-000000000001", stage: "setup", phase: "setup", position: 1, startDay: 1, endDay: 1, nextAction: "Sow", actionIntervalDays: 1, guidance: "Sow evenly", observationPrompt: "Is it damp?", whatIsHappening: "Hydration", milestone: "Sown", whatGoodLooksLike: "Even", commonProblems: [], photoCheckPrompt: null, harvestReady: false, harvestCriteria: null },
    { id: "40000000-0000-4000-8000-000000000002", stage: "growth", phase: "growth", position: 2, startDay: 2, endDay: 12, nextAction: "Check moisture", actionIntervalDays: 1, guidance: "Keep damp", observationPrompt: "Are shoots upright?", whatIsHappening: "Growth", milestone: "Green", whatGoodLooksLike: "Upright", commonProblems: [], photoCheckPrompt: null, harvestReady: false, harvestCriteria: null },
    { id: "40000000-0000-4000-8000-000000000003", stage: "harvest", phase: "harvest", position: 3, startDay: 13, endDay: 14, nextAction: "Harvest", actionIntervalDays: 1, guidance: "Cut cleanly", observationPrompt: "Ready?", whatIsHappening: "Ready", milestone: "Harvest", whatGoodLooksLike: "Green", commonProblems: [], photoCheckPrompt: null, harvestReady: true, harvestCriteria: {} }
  ]
};

function cycle(id: string, overrides: Partial<CycleState> = {}): CycleState {
  return { id, seedId: seed.id, seedContentVersion: 1, status: "active", startedAt: "2026-08-20T09:00:00Z", timezone: "Europe/London", currentStageId: null, lastActionAt: "2026-08-24T09:00:00Z", harvestCount: 0, harvestedAt: null, lastHarvestedAt: null, ...overrides };
}

describe("Stage 6 core loop", () => {
  it("supports Home with zero, one, and three active cycles", () => {
    const clock = new TestClock("2026-08-25T10:00:00Z");
    const views = ["one", "two", "three"].map((id) => buildCycleView(cycle(id, { startedAt: "2026-08-25T09:00:00Z", lastActionAt: "2026-08-25T09:00:00Z" }), seed, clock));
    expect(prioritizeCycleViews([])).toEqual([]);
    expect(prioritizeCycleViews(views.slice(0, 1))).toHaveLength(1);
    expect(prioritizeCycleViews(views)).toHaveLength(3);
  });

  it("makes an action completion visibly available to presentation", () => {
    const clock = new TestClock("2026-08-25T10:00:00Z");
    const pending = buildCycleView(cycle("pending", { lastActionAt: null }), seed, clock);
    const completed = buildCycleView(cycle("completed", { lastActionAt: "2026-08-25T09:00:00Z" }), seed, clock);
    expect(pending.actionDue).toBe(true);
    expect(pending.actionCompletedToday).toBe(false);
    expect(completed.actionDue).toBe(false);
    expect(completed.actionCompletedToday).toBe(true);
  });

  it("orders Home by harvest ready, needs check, action due, harvest soon, then normal", () => {
    const harvest = buildCycleView(cycle("harvest", { startedAt: "2026-08-13T09:00:00Z" }), seed, new TestClock("2026-08-25T10:00:00Z"));
    const overdue = buildCycleView(cycle("overdue", { lastActionAt: "2026-08-22T09:00:00Z" }), seed, new TestClock("2026-08-25T10:00:00Z"));
    const due = buildCycleView(cycle("due", { lastActionAt: null }), seed, new TestClock("2026-08-25T10:00:00Z"));
    const soon = buildCycleView(cycle("soon", { lastActionAt: "2026-08-25T09:00:00Z" }), seed, new TestClock("2026-08-25T10:00:00Z"));
    const normal = buildCycleView(cycle("normal", { startedAt: "2026-08-25T09:00:00Z", lastActionAt: "2026-08-25T09:00:00Z" }), seed, new TestClock("2026-08-25T10:00:00Z"));
    expect(prioritizeCycleViews([normal, soon, due, overdue, harvest]).map((item) => item.priority)).toEqual(["harvest_ready", "needs_check", "action_due", "harvest_soon", "normal"]);
  });

  it("uses onboarding answers in the recommendation before onboarding ends", () => {
    expect(explainCressRecommendation({ ...defaultOnboardingAnswers, environment: "balcony", timeAvailability: "minimal" })).toContain("your balcony");
  });
});

describe("Stage 6 migration", () => {
  const sql = readFileSync(join(process.cwd(), "supabase", "migrations", "202608250007_stage6_core_loop.sql"), "utf8").toLowerCase();
  it.each(["complete_onboarding", "mark_cycle_action_done", "archive_cycle", "restart_cycle"])("defines atomic %s", (name) => expect(sql).toContain(`function public.${name}`));
  it("keeps cycle writes behind authenticated functions", () => { expect(sql).toContain("auth.uid()"); expect(sql).toContain("grant execute"); });
});
