import { describe, expect, it } from "vitest";

import { resolveSeedAccess } from "@/src/application/content/access";
import { publishedSeedSchema, seedSummarySchema } from "@/src/domain/content";

const summary = {
  id: "10000000-0000-4000-8000-000000000001",
  slug: "cress",
  commonName: "Cress",
  botanicalName: "Lepidium sativum",
  description: "A quick first grow.",
  expectedResult: "An even green canopy.",
  contentVersion: 1,
  durationDaysMin: 7,
  durationDaysMax: 14,
  difficulty: "Easy",
  environmentSummary: "Bright indoor space",
  lightSummary: "Bright indirect light",
  accessType: "free" as const,
  images: [{ kind: "bundled" as const, key: "cress" as const }],
  reviewStatus: "draft" as const
};

describe("Stage 5 seed content", () => {
  it("validates a complete database seed and rejects malformed duration or assets", () => {
    expect(seedSummarySchema.parse(summary)).toEqual(summary);
    expect(seedSummarySchema.safeParse({ ...summary, durationDaysMin: 15 }).success).toBe(false);
    expect(seedSummarySchema.safeParse({ ...summary, images: [] }).success).toBe(false);
    expect(seedSummarySchema.safeParse({ ...summary, accessType: "coming_soon", images: [] }).success).toBe(true);
  });

  it("rejects launch content with missing stages or gaps", () => {
    const seed = { ...summary, harvestMode: "single", materials: ["Tray"], harvestInstructions: "Cut cleanly.", harvestReadiness: "Leaves open.", storageGuidance: "Use promptly.", tasteProfile: "Peppery", stages: [] };
    expect(publishedSeedSchema.safeParse(seed).success).toBe(false);
    expect(publishedSeedSchema.safeParse({ ...seed, accessType: "coming_soon", images: [] }).success).toBe(true);
  });

  it("enforces free, paid and coming-soon access independently of the UI", () => {
    expect(resolveSeedAccess("free")).toEqual({ state: "available", canStart: true });
    expect(resolveSeedAccess("paid")).toEqual({ state: "locked", canStart: false });
    expect(resolveSeedAccess("paid", true)).toEqual({ state: "available", canStart: true });
    expect(resolveSeedAccess("coming_soon", true)).toEqual({ state: "comingSoon", canStart: false });
  });
});

