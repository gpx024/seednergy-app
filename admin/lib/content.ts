import { z } from "zod";

import { cmsSeedImageSchema } from "./seedImages";

export const stageSchema = z.object({
  id: z.string().optional(), stage: z.string().min(1), phase: z.enum(["setup", "growth", "harvest"]),
  position: z.number().int().positive(), day_from: z.number().int().positive(), day_to: z.number().int().positive().nullable(),
  guidance: z.string().min(1), next_action: z.string().min(1), action_interval_days: z.number().int().positive(),
  observation_prompt: z.string().min(1), what_is_happening: z.string().min(1), milestone: z.string().min(1),
  what_good_looks_like: z.string().min(1), common_problems: z.array(z.string()), photo_check_prompt: z.string().nullable(),
  harvest_ready: z.boolean(), harvest_criteria: z.unknown().nullable().optional(), image: z.string().nullable().optional()
});

export const seedDraftSchema = z.object({
  id: z.string().uuid(), slug: z.string().min(1), name: z.string().min(1), botanical_name: z.string().min(1),
  description: z.string().min(1), expected_result: z.string().min(1), duration_days: z.number().int().positive(),
  duration_days_min: z.number().int().positive(), duration_days_max: z.number().int().positive(),
  difficulty_label: z.string().min(1), environment_summary: z.string().min(1), light_summary: z.string().min(1),
  access_type: z.enum(["free", "paid", "coming_soon"]), taste_profile: z.string().min(1),
  materials: z.array(z.string()), images: z.array(cmsSeedImageSchema), active: z.boolean(), harvest_mode: z.enum(["single", "repeating"]),
  harvest_instructions: z.string().min(1), harvest_readiness: z.string().min(1), storage_guidance: z.string().min(1),
  content_review_status: z.enum(["draft", "grower_reviewed"]), content_sources: z.array(z.string()), content_version: z.number().int().positive()
}).superRefine((seed, context) => {
  if (seed.duration_days_max < seed.duration_days_min) context.addIssue({ code: "custom", path: ["duration_days_max"], message: "Maximum days must be at least minimum days." });
});

export function validatePublication(seed: unknown, stages: unknown) {
  const seedResult = seedDraftSchema.safeParse(seed);
  const stageResult = z.array(stageSchema).min(1).safeParse(stages);
  return {
    valid: seedResult.success && stageResult.success,
    errors: [...(seedResult.success ? [] : seedResult.error.issues), ...(stageResult.success ? [] : stageResult.error.issues)].map((issue) => `${issue.path.join(".")}: ${issue.message}`)
  };
}
