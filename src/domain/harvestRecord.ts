import { z } from "zod";

export const harvestSuggestionSchema = z.object({
  title: z.string().min(1).max(60),
  description: z.string().min(1).max(180)
});

export const harvestSuggestionsSchema = z.object({
  headline: z.string().min(1).max(90),
  ideas: z.array(harvestSuggestionSchema).min(3).max(5)
});

export const harvestRecordSchema = z.object({
  id: z.uuid(),
  cycleId: z.uuid(),
  userId: z.uuid(),
  seedId: z.uuid(),
  harvestNumber: z.int().positive(),
  harvestedAt: z.iso.datetime(),
  storagePath: z.string().min(1).nullable(),
  suggestions: harvestSuggestionsSchema.nullable(),
  suggestionStatus: z.enum(["pending", "completed", "fallback", "failed"]),
  promptVersion: z.string().nullable(),
  modelVersion: z.string().nullable(),
  costEstimate: z.number().nonnegative(),
  latencyMs: z.int().nonnegative()
});

export type HarvestSuggestion = z.infer<typeof harvestSuggestionSchema>;
export type HarvestSuggestions = z.infer<typeof harvestSuggestionsSchema>;
export type HarvestRecord = z.infer<typeof harvestRecordSchema>;
