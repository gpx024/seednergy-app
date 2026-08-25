import { z } from "zod";

export const seedAccessTypeSchema = z.enum(["free", "paid", "coming_soon"]);
export const contentReviewStatusSchema = z.enum(["draft", "grower_reviewed"]);
export const seedAssetSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("bundled"), key: z.enum(["cress", "pea-shoots", "radish-microgreens", "broccoli-microgreens"]) }),
  z.object({ kind: z.literal("remote"), url: z.url() })
]);

export const seedSummarySchema = z.object({
  id: z.uuid(),
  slug: z.string().min(1),
  commonName: z.string().min(1),
  botanicalName: z.string().min(1),
  description: z.string().min(1),
  expectedResult: z.string().min(1),
  contentVersion: z.int().positive(),
  durationDaysMin: z.int().positive(),
  durationDaysMax: z.int().positive(),
  difficulty: z.string().min(1),
  environmentSummary: z.string().min(1),
  lightSummary: z.string().min(1),
  accessType: seedAccessTypeSchema,
  images: z.array(seedAssetSchema),
  reviewStatus: contentReviewStatusSchema
}).superRefine((seed, context) => {
  if (seed.durationDaysMax < seed.durationDaysMin) context.addIssue({ code: "custom", message: "Maximum duration cannot be shorter than minimum duration.", path: ["durationDaysMax"] });
  if (seed.accessType !== "coming_soon" && seed.images.length === 0) context.addIssue({ code: "custom", message: "A published launch seed requires an image.", path: ["images"] });
});

export const seedStageSchema = z.object({
  id: z.uuid(),
  stage: z.string().min(1),
  phase: z.enum(["setup", "growth", "harvest"]),
  position: z.int().positive(),
  startDay: z.int().positive(),
  endDay: z.int().positive().nullable(),
  nextAction: z.string().min(1),
  actionIntervalDays: z.int().positive(),
  guidance: z.string().min(1),
  observationPrompt: z.string().min(1),
  whatIsHappening: z.string().min(1),
  milestone: z.string().min(1),
  whatGoodLooksLike: z.string().min(1),
  commonProblems: z.array(z.string().min(1)),
  photoCheckPrompt: z.string().min(1).nullable(),
  harvestReady: z.boolean(),
  harvestCriteria: z.record(z.string(), z.json()).nullable()
});

export const publishedSeedSchema = seedSummarySchema.safeExtend({
  harvestMode: z.enum(["single", "repeating"]),
  materials: z.array(z.string().min(1)),
  harvestInstructions: z.string().min(1),
  harvestReadiness: z.string().min(1),
  storageGuidance: z.string().min(1),
  tasteProfile: z.string().min(1),
  stages: z.array(seedStageSchema)
}).superRefine((seed, context) => {
  if (seed.accessType !== "coming_soon" && seed.stages.length === 0) {
    context.addIssue({ code: "custom", message: "A published launch seed requires at least one stage.", path: ["stages"] });
  }
  for (let index = 0; index < seed.stages.length; index += 1) {
    const stage = seed.stages[index];
    if (!stage) continue;
    const expectedStart = index === 0 ? 1 : (seed.stages[index - 1]?.endDay ?? null);
    if (index === 0 && stage.startDay !== 1) context.addIssue({ code: "custom", message: "Stages must begin on day 1.", path: ["stages", index] });
    if (index > 0 && (expectedStart === null || stage.startDay !== expectedStart + 1)) context.addIssue({ code: "custom", message: "Stages cannot contain gaps or overlaps.", path: ["stages", index] });
  }
});

export type SeedAccessType = z.infer<typeof seedAccessTypeSchema>;
export type SeedAsset = z.infer<typeof seedAssetSchema>;
export type SeedSummary = z.infer<typeof seedSummarySchema>;
export type PublishedSeed = z.infer<typeof publishedSeedSchema>;
