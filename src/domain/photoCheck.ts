import { z } from "zod";

export const photoCheckTypeSchema = z.enum(["progress", "issue", "stage_review", "harvest_readiness", "follow_up"]);
export const photoCheckStatusSchema = z.enum(["on_track", "issue_likely", "unclear", "harvest_likely", "not_ready", "rejected", "provider_error"]);
export const photoCheckConfidenceSchema = z.enum(["high", "medium", "low", "unknown"]);

export const analysisResultSchema = z.object({
  status: photoCheckStatusSchema,
  confidence: photoCheckConfidenceSchema,
  causes: z.array(z.string().min(1)).optional(),
  promptVersion: z.string().min(1),
  modelVersion: z.string().min(1),
  costEstimate: z.number().nonnegative()
});

export const coachingResultSchema = z.object({
  headline: z.string().min(1),
  explanation: z.string().min(1),
  actions: z.array(z.string().min(1)).min(1),
  retakeGuidance: z.string().min(1).optional()
});

export const photoCheckResultSchema = analysisResultSchema.merge(coachingResultSchema);

export const photoCheckContextSchema = z.object({
  cycleId: z.uuid(),
  seedId: z.uuid(),
  seedName: z.string().min(1),
  seedContentVersion: z.int().positive(),
  stageId: z.string().min(1),
  phase: z.enum(["setup", "growth", "harvest"]),
  day: z.int().positive(),
  lightCondition: z.string().nullable(),
  whatGoodLooksLike: z.string().min(1),
  commonProblems: z.array(z.string().min(1)),
  authoredPrompt: z.string().nullable()
});

export function consumesPhotoCheckQuota(status: PhotoCheckStatus): boolean {
  return status !== "unclear" && status !== "rejected" && status !== "provider_error";
}

export type PhotoCheckType = z.infer<typeof photoCheckTypeSchema>;
export type PhotoCheckStatus = z.infer<typeof photoCheckStatusSchema>;
export type PhotoCheckConfidence = z.infer<typeof photoCheckConfidenceSchema>;
export type AnalysisResult = z.infer<typeof analysisResultSchema>;
export type CoachingResult = z.infer<typeof coachingResultSchema>;
export type PhotoCheckResult = z.infer<typeof photoCheckResultSchema>;
export type PhotoCheckContext = z.infer<typeof photoCheckContextSchema>;
