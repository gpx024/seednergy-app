import { describe, expect, it } from "vitest";

import { consumesPhotoCheckQuota, photoCheckResultSchema, type PhotoCheckContext } from "@/src/domain/photoCheck";
import { FixturePhotoCheckProvider } from "@/src/infrastructure/ai/FixturePhotoCheckProvider";
import { photoCheckFixtureIds, photoCheckFixtures } from "@/src/infrastructure/ai/photoCheckFixtures";
import { runPhotoCheck } from "@/src/application/photoChecks/runPhotoCheck";
import type { CoachingProvider } from "@/src/ports/CoachingProvider";
import type { VisionProvider } from "@/src/ports/VisionProvider";

const context: PhotoCheckContext = {
  cycleId: "10000000-0000-4000-8000-000000000001",
  seedId: "20000000-0000-4000-8000-000000000001",
  seedName: "Cress",
  seedContentVersion: 1,
  stageId: "growth",
  phase: "growth",
  day: 3,
  lightCondition: "bright",
  whatGoodLooksLike: "Upright green growth",
  commonProblems: ["Low light", "Excess moisture"],
  authoredPrompt: "Compare the visible growth with this authored stage."
};

describe("Stage 7 deterministic photo checks", () => {
  it("keeps all six blueprint fixtures valid and available", () => {
    expect(photoCheckFixtureIds).toHaveLength(6);
    for (const id of photoCheckFixtureIds) expect(photoCheckResultSchema.safeParse(photoCheckFixtures[id]).success).toBe(true);
  });

  it.each([
    ["AI-001", "on_track"], ["AI-002", "unclear"], ["AI-003", "issue_likely"],
    ["AI-004", "issue_likely"], ["AI-005", "harvest_likely"], ["AI-006", "rejected"]
  ])("returns %s through the exact provider interfaces", async (fixtureId, status) => {
    const provider = new FixturePhotoCheckProvider();
    const vision: VisionProvider = provider; const coaching: CoachingProvider = provider;
    const result = await runPhotoCheck({ fixtureId, checkType: "progress", storagePath: "user/cycle/photo.jpg", context, visionProvider: vision, coachingProvider: coaching });
    expect(result.status).toBe(status);
    expect(result.actions).toHaveLength(1);
    expect(result.costEstimate).toBe(0);
  });

  it("does not consume quota for unclear, rejected, or provider errors", () => {
    expect(consumesPhotoCheckQuota("unclear")).toBe(false);
    expect(consumesPhotoCheckQuota("rejected")).toBe(false);
    expect(consumesPhotoCheckQuota("provider_error")).toBe(false);
    expect(consumesPhotoCheckQuota("on_track")).toBe(true);
    expect(consumesPhotoCheckQuota("issue_likely")).toBe(true);
  });

  it("uses honest uncertainty and actionable retake guidance", () => {
    expect(photoCheckFixtures["AI-002"].confidence).toBe("unknown");
    expect(photoCheckFixtures["AI-002"].retakeGuidance).toBeTruthy();
    expect(photoCheckFixtures["AI-003"].explanation).toMatch(/looks consistent|most likely/i);
    expect(photoCheckFixtures["AI-006"].retakeGuidance).toBeTruthy();
  });
});
