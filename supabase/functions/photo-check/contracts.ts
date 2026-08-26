import { z } from "npm:zod@4.4.3";

export const photoCheckTypeSchema = z.enum(["progress", "issue", "stage_review", "harvest_readiness", "follow_up"]);
export const photoCheckStatusSchema = z.enum(["on_track", "issue_likely", "unclear", "harvest_likely", "not_ready", "rejected", "provider_error"]);
export const photoCheckConfidenceSchema = z.enum(["high", "medium", "low", "unknown"]);

export const requestSchema = z.object({
  requestId: z.uuid(),
  cycleId: z.uuid(),
  checkType: photoCheckTypeSchema,
  storagePath: z.string().min(1).max(500)
});
export type PhotoCheckRequest = z.infer<typeof requestSchema>;

export const modelOutputSchema = z.object({
  status: photoCheckStatusSchema.exclude(["provider_error"]),
  confidence: photoCheckConfidenceSchema,
  headline: z.string().min(1).max(90),
  explanation: z.string().min(1).max(600),
  causes: z.array(z.string().min(1).max(120)).max(4).nullable(),
  actions: z.array(z.string().min(1).max(240)).min(1).max(2),
  retake_guidance: z.string().min(1).max(400).nullable()
});

export const modelOutputJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["status", "confidence", "headline", "explanation", "causes", "actions", "retake_guidance"],
  properties: {
    status: { type: "string", enum: ["on_track", "issue_likely", "unclear", "harvest_likely", "not_ready", "rejected"] },
    confidence: { type: "string", enum: ["high", "medium", "low", "unknown"] },
    headline: { type: "string", minLength: 1, maxLength: 90 },
    explanation: { type: "string", minLength: 1, maxLength: 600 },
    causes: {
      anyOf: [
        { type: "array", maxItems: 4, items: { type: "string", minLength: 1, maxLength: 120 } },
        { type: "null" }
      ]
    },
    actions: { type: "array", minItems: 1, maxItems: 2, items: { type: "string", minLength: 1, maxLength: 240 } },
    retake_guidance: { anyOf: [{ type: "string", minLength: 1, maxLength: 400 }, { type: "null" }] }
  }
} as const;

export interface ServerPhotoContext {
  cycleId: string;
  seedId: string;
  seedName: string;
  seedContentVersion: number;
  stageId: string;
  phase: "setup" | "growth" | "harvest";
  day: number;
  lightCondition: string | null;
  whatGoodLooksLike: string;
  commonProblems: string[];
  authoredPrompt: string | null;
}

export interface UsageSummary {
  inputTokens: number;
  cachedInputTokens: number;
  outputTokens: number;
  costEstimate: number;
}

export interface PhotoCheckResult {
  status: z.infer<typeof photoCheckStatusSchema>;
  confidence: z.infer<typeof photoCheckConfidenceSchema>;
  headline: string;
  explanation: string;
  causes?: string[];
  actions: string[];
  retakeGuidance?: string;
  promptVersion: string;
  modelVersion: string;
  costEstimate: number;
}
