import { modelOutputJsonSchema, modelOutputSchema, type PhotoCheckResult, type ServerPhotoContext, type UsageSummary } from "./contracts.ts";
import { buildUserPrompt, PROMPT_VERSION, SYSTEM_PROMPT } from "./prompt.ts";

const REQUEST_TIMEOUT_MS = 25_000;
const MAX_ATTEMPTS = 2;
const LUNA_INPUT_USD_PER_MILLION = 0.20;
const LUNA_CACHED_INPUT_USD_PER_MILLION = 0.02;
const LUNA_OUTPUT_USD_PER_MILLION = 1.20;

interface OpenAIResponse {
  id?: string;
  model?: string;
  output_text?: string;
  output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string; refusal?: string }> }>;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    input_tokens_details?: { cached_tokens?: number };
  };
}

export interface OpenAIPhotoCheck {
  result: PhotoCheckResult;
  usage: UsageSummary;
  providerRequestId: string | null;
  attemptCount: number;
  modelVersion: string;
}

export class ProviderCallError extends Error {
  constructor(message: string, readonly code: string, readonly attempts: number) {
    super(message);
  }
}

export async function runOpenAIPhotoCheck(input: {
  apiKey: string;
  model: string;
  imageDataUrl: string;
  context: ServerPhotoContext;
  checkType: string;
  safetyIdentifier: string;
}): Promise<OpenAIPhotoCheck> {
  let lastError: unknown = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await requestResponse(input);
      const text = extractOutputText(response);
      const guarded = applyGuardrails(modelOutputSchema.parse(JSON.parse(text)));
      const usage = usageSummary(response.usage, input.model);
      return {
        result: {
          status: guarded.status,
          confidence: guarded.confidence,
          headline: guarded.headline,
          explanation: guarded.explanation,
          ...(guarded.causes ? { causes: guarded.causes } : {}),
          actions: guarded.actions,
          ...(guarded.retake_guidance ? { retakeGuidance: guarded.retake_guidance } : {}),
          promptVersion: PROMPT_VERSION,
          modelVersion: response.model ?? input.model,
          costEstimate: usage.costEstimate
        },
        usage,
        providerRequestId: response.id ?? null,
        attemptCount: attempt,
        modelVersion: response.model ?? input.model
      };
    } catch (error) {
      lastError = error;
      if (attempt < MAX_ATTEMPTS && isRetryable(error)) continue;
      const code = error instanceof RequestError ? error.code : error instanceof DOMException && error.name === "AbortError" ? "provider_timeout" : "invalid_provider_response";
      throw new ProviderCallError("The AI provider could not complete this photo check.", code, attempt);
    }
  }
  throw new ProviderCallError("The AI provider could not complete this photo check.", "provider_error", MAX_ATTEMPTS);
}

class RequestError extends Error {
  constructor(readonly status: number, readonly code: string, readonly retryable = false) { super(`OpenAI request failed (${status}).`); }
}

async function requestResponse(input: {
  apiKey: string;
  model: string;
  imageDataUrl: string;
  context: ServerPhotoContext;
  checkType: string;
  safetyIdentifier: string;
}): Promise<OpenAIResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      signal: controller.signal,
      headers: { Authorization: `Bearer ${input.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: input.model,
        instructions: SYSTEM_PROMPT,
        input: [{
          role: "user",
          content: [
            { type: "input_text", text: buildUserPrompt(input.context, input.checkType) },
            { type: "input_image", image_url: input.imageDataUrl, detail: "high" }
          ]
        }],
        reasoning: { effort: "low" },
        max_output_tokens: 900,
        text: { format: { type: "json_schema", name: "seednergy_photo_check", strict: true, schema: modelOutputJsonSchema } },
        metadata: { prompt_version: PROMPT_VERSION, check_type: input.checkType },
        safety_identifier: input.safetyIdentifier,
        store: false
      })
    });
    if (!response.ok) {
      const retryable = response.status === 408 || response.status === 409 || response.status === 429 || response.status >= 500;
      const providerCode = await safeProviderErrorCode(response);
      throw new RequestError(response.status, `provider_http_${response.status}_${providerCode}`, retryable);
    }
    return await response.json() as OpenAIResponse;
  } finally {
    clearTimeout(timeout);
  }
}

function extractOutputText(response: OpenAIResponse): string {
  if (response.output_text) return response.output_text;
  for (const item of response.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "refusal") throw new RequestError(422, "provider_refusal");
      if (content.type === "output_text" && content.text) return content.text;
    }
  }
  throw new RequestError(502, "provider_empty_response", true);
}

function isRetryable(error: unknown): boolean {
  if (error instanceof RequestError) return error.retryable;
  if (error instanceof DOMException && error.name === "AbortError") return true;
  return error instanceof SyntaxError || (typeof error === "object" && error !== null && "issues" in error);
}

async function safeProviderErrorCode(response: Response): Promise<string> {
  try {
    const body = await response.json() as { error?: { code?: string; type?: string } };
    const value = body.error?.code ?? body.error?.type ?? "unknown";
    return value.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80);
  } catch {
    return "unknown";
  }
}

function usageSummary(usage: OpenAIResponse["usage"], model: string): UsageSummary {
  const inputTokens = Math.max(usage?.input_tokens ?? 0, 0);
  const cachedInputTokens = Math.min(Math.max(usage?.input_tokens_details?.cached_tokens ?? 0, 0), inputTokens);
  const outputTokens = Math.max(usage?.output_tokens ?? 0, 0);
  if (model !== "gpt-5.6-luna") throw new RequestError(500, "unpriced_model");
  const costEstimate = ((inputTokens - cachedInputTokens) * LUNA_INPUT_USD_PER_MILLION
    + cachedInputTokens * LUNA_CACHED_INPUT_USD_PER_MILLION
    + outputTokens * LUNA_OUTPUT_USD_PER_MILLION) / 1_000_000;
  return { inputTokens, cachedInputTokens, outputTokens, costEstimate: Number(costEstimate.toFixed(8)) };
}

function applyGuardrails(output: ReturnType<typeof modelOutputSchema.parse>) {
  const combined = [output.headline, output.explanation, ...output.actions, ...(output.causes ?? [])].join(" ");
  if (/\b(fungicide|pesticide|herbicide|bleach|hydrogen peroxide|chemical treatment|safe to eat|toxic|poisonous|medical|human health|animal health)\b/i.test(combined)) {
    return {
      status: "unclear" as const,
      confidence: "unknown" as const,
      headline: "A closer check would be safer",
      explanation: "The photo does not support a safe, specific assessment. Seednergy will not make treatment or health claims from this image.",
      causes: null,
      actions: ["Take a clear photo in natural light and check the growing medium by touch."],
      retake_guidance: "Frame the whole tray, move close enough to see the leaves and medium, and keep the image sharp."
    };
  }

  const result = { ...output, actions: output.actions.slice(0, 1) };
  if (result.status === "rejected") {
    result.confidence = "unknown";
    result.causes = null;
    result.retake_guidance ??= "Photograph only the active growing tray, with the plant clearly visible.";
  } else if (result.status === "unclear" || result.confidence === "low" || result.confidence === "unknown") {
    result.status = "unclear";
    result.confidence = result.confidence === "low" ? "low" : "unknown";
    result.causes = null;
    result.retake_guidance ??= "Use natural light, include the whole tray, move close enough to see the leaves, and keep the image sharp.";
  } else if (result.confidence === "medium" && !/looks consistent|most likely|appears|may|likely|suggests/i.test(result.explanation)) {
    result.explanation = `This looks consistent with the visible signs, but a photo cannot confirm the cause. ${result.explanation}`;
  }
  result.headline = result.headline.replace(/\b(definitely|certainly|guaranteed)\b/gi, "likely");
  result.explanation = result.explanation.replace(/\b(definitely|certainly|guaranteed)\b/gi, "likely");
  return result;
}
