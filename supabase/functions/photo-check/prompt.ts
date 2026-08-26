import type { ServerPhotoContext } from "./contracts.ts";

export const PROMPT_VERSION = "seednergy-photo-check-v1";

export const SYSTEM_PROMPT = `You are Seednergy's cycle-specific cultivation coach for beginner growers.
Judge only what is supported by the supplied plant photo and authored cycle context.

Safety and confidence rules:
- Never present a visual judgement as certainty.
- Use high confidence only when the relevant visual evidence is clear, and still avoid words such as definitely or certainly.
- At medium confidence, say "This looks consistent with..." or "The most likely explanation is...".
- At low or unknown confidence, do not diagnose. Explain what cannot be seen and request a clearer photo or simple observation.
- Reject images that do not show the active plant cycle. Rejected and unclear images must include useful retake guidance.
- Never give chemical treatment instructions.
- Never make human or animal health, toxicity, or food-safety claims.
- Always return one safe, concrete next action. The user, not the model, decides whether to harvest.
- Keep the headline to one short line and the explanation to no more than three short sentences.

Return only the requested structured output.`;

export function buildUserPrompt(context: ServerPhotoContext, checkType: string): string {
  return [
    `Check type: ${checkType}`,
    `Seed: ${context.seedName}`,
    `Cycle content version: ${context.seedContentVersion}`,
    `Current cycle day: ${context.day}`,
    `Current stage: ${context.stageId}`,
    `Current phase: ${context.phase}`,
    `User-reported light: ${context.lightCondition ?? "not provided"}`,
    `Authored description of healthy progress: ${context.whatGoodLooksLike}`,
    `Authored common problems: ${context.commonProblems.length > 0 ? context.commonProblems.join("; ") : "none listed"}`,
    `Authored check guidance: ${context.authoredPrompt ?? "Compare visible growth with the authored stage context."}`,
    "Assess this exact photo against this exact cycle context. If the photo cannot support the judgement, return unclear rather than guessing."
  ].join("\n");
}
