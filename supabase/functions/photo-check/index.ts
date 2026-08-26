import { createClient } from "npm:@supabase/supabase-js@2.112.4";

import { requestSchema, type PhotoCheckRequest, type PhotoCheckResult, type ServerPhotoContext } from "./contracts.ts";
import { ProviderCallError, runOpenAIPhotoCheck } from "./openai.ts";
import { PROMPT_VERSION } from "./prompt.ts";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "method_not_allowed", message: "Use POST for photo checks." }, 405);

  const startedAt = Date.now();
  let logId: string | null = null;
  let leaseToken: string | null = null;
  let userId: string | null = null;
  let photoInput: PhotoCheckRequest | null = null;
  let serviceClient: ReturnType<typeof createClient> | null = null;
  try {
    const env = readEnvironment();
    const authorization = request.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) return json({ error: "authentication_required", message: "Log in before checking a photo." }, 401);

    const userClient = createClient(env.supabaseUrl, env.anonKey, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false } });
    const { data: authData, error: authError } = await userClient.auth.getUser();
    if (authError || !authData.user) return json({ error: "authentication_required", message: "Your session has expired. Log in and try again." }, 401);
    userId = authData.user.id;
    photoInput = requestSchema.parse(await request.json());
    leaseToken = crypto.randomUUID();

    serviceClient = createClient(env.supabaseUrl, env.serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const context = await loadServerContext(serviceClient, userId, photoInput.cycleId);
    assertOwnedStoragePath(photoInput.storagePath, userId, photoInput.cycleId);

    const { data: reservation, error: reservationError } = await serviceClient.rpc("begin_ai_photo_check", {
      p_user_id: userId,
      p_cycle_id: photoInput.cycleId,
      p_client_event_id: photoInput.requestId,
      p_daily_limit: env.dailyLimit,
      p_model_version: env.model,
      p_prompt_version: PROMPT_VERSION,
      p_lease_token: leaseToken
    });
    if (reservationError) {
      if (reservationError.message.includes("ai_quota_exceeded")) return json({ error: "quota_exceeded", message: "You have reached today’s development photo-check limit. Try again tomorrow." }, 429);
      throw new Error(`quota_reservation_failed:${reservationError.code ?? "unknown"}`);
    }
    const reserved = reservation as { id?: string; state?: string; lease_token?: string | null } | null;
    logId = String(reserved?.id ?? "");
    if (!logId) throw new Error("quota_reservation_missing");
    if (reserved?.lease_token !== leaseToken) {
      const { data: existing } = await serviceClient.from("photo_checks").select("id,result").eq("user_id", userId).eq("client_event_id", photoInput.requestId).maybeSingle();
      if (existing?.id && existing.result) return json({ result: existing.result, checkId: existing.id });
      return json({ error: "request_in_progress", message: "This photo check is already being processed." }, 409);
    }

    const imageDataUrl = await loadImageDataUrl(serviceClient, photoInput.storagePath);
    const safetyIdentifier = await sha256(userId);
    const checked = await runOpenAIPhotoCheck({ apiKey: env.openAIKey, model: env.model, imageDataUrl, context, checkType: photoInput.checkType, safetyIdentifier });
    const checkId = await completeAndSave(serviceClient, logId, leaseToken, userId, photoInput, checked.result, {
      ...checked.usage,
      latencyMs: Date.now() - startedAt,
      attemptCount: checked.attemptCount,
      providerRequestId: checked.providerRequestId,
      errorCode: null
    });
    console.info(JSON.stringify({ event: "photo_check_completed", requestId: logId, status: checked.result.status, model: checked.modelVersion, promptVersion: PROMPT_VERSION, latencyMs: Date.now() - startedAt, costEstimateUsd: checked.usage.costEstimate }));
    return json({ result: checked.result, checkId });
  } catch (error) {
    const providerError = error instanceof ProviderCallError;
    const errorCode = providerError ? error.code : safeErrorCode(error);
    const result = providerFailureResult(errorCode);
    if (serviceClient && logId && leaseToken && userId && photoInput) {
      try {
        const checkId = await completeAndSave(serviceClient, logId, leaseToken, userId, photoInput, result, {
          inputTokens: 0, cachedInputTokens: 0, outputTokens: 0, costEstimate: 0,
          latencyMs: Date.now() - startedAt, attemptCount: providerError ? error.attempts : 0,
          providerRequestId: null, errorCode
        });
        console.error(JSON.stringify({ event: "photo_check_failed", requestId: logId, errorCode, latencyMs: Date.now() - startedAt }));
        return json({ result, checkId });
      } catch {
        console.error(JSON.stringify({ event: "photo_check_persistence_failed", requestId: logId, errorCode, latencyMs: Date.now() - startedAt }));
        return json({ error: "photo_check_persistence_failed", message: "The photo check could not be saved. This attempt will not use an allowance." }, 503);
      }
    }
    console.error(JSON.stringify({ event: "photo_check_failed", requestId: logId, errorCode, latencyMs: Date.now() - startedAt }));
    if (errorCode === "invalid_request") return json({ error: errorCode, message: "The photo-check request was invalid." }, 400);
    if (errorCode === "active_cycle_not_found" || errorCode === "storage_path_not_owned") return json({ error: errorCode, message: "This photo does not belong to the active cycle." }, 403);
    return json({ result });
  }
});

function readEnvironment() {
  const value = (name: string) => {
    const result = Deno.env.get(name);
    if (!result) throw new Error(`missing_configuration_${name.toLowerCase()}`);
    return result;
  };
  return {
    supabaseUrl: value("SUPABASE_URL"), anonKey: value("SUPABASE_ANON_KEY"), serviceRoleKey: value("SUPABASE_SERVICE_ROLE_KEY"),
    openAIKey: value("OPENAI_API_KEY"),
    model: value("OPENAI_MODEL").trim(),
    dailyLimit: parseDailyLimit(Deno.env.get("AI_DAILY_CHECK_LIMIT"))
  };
}

function parseDailyLimit(value: string | undefined): number {
  const parsed = Number(value ?? "25");
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 1000) throw new Error("invalid_ai_daily_limit_configuration");
  return parsed;
}

async function loadServerContext(client: ReturnType<typeof createClient>, userId: string, cycleId: string): Promise<ServerPhotoContext> {
  const { data: cycle, error: cycleError } = await client.from("cycles").select("id,user_id,seed_id,seed_content_version,status,started_at,timezone").eq("id", cycleId).eq("user_id", userId).maybeSingle();
  if (cycleError) throw new Error(`cycle_query_failed:${cycleError.code}`);
  if (!cycle || !["active", "harvest_ready"].includes(cycle.status)) throw new Error("active_cycle_not_found");
  const [{ data: seed, error: seedError }, { data: stages, error: stagesError }, { data: profile, error: profileError }] = await Promise.all([
    client.from("seeds").select("id,name,content_version").eq("id", cycle.seed_id).maybeSingle(),
    client.from("seed_stages").select("stage,phase,day_from,day_to,what_good_looks_like,common_problems,photo_check_prompt,position").eq("seed_id", cycle.seed_id).order("position"),
    client.from("profiles").select("light_condition_slug").eq("id", userId).maybeSingle()
  ]);
  if (seedError || stagesError || profileError) throw new Error("context_query_failed");
  if (!seed || seed.content_version !== cycle.seed_content_version || !stages?.length) throw new Error("authored_context_unavailable");
  const day = calculateCycleDay(cycle.started_at, cycle.timezone);
  const stage = stages.find((candidate) => day >= candidate.day_from && (candidate.day_to === null || day <= candidate.day_to)) ?? stages.at(-1);
  if (!stage || !["setup", "growth", "harvest"].includes(stage.phase)) throw new Error("authored_context_unavailable");
  return {
    cycleId: cycle.id,
    seedId: seed.id,
    seedName: seed.name,
    seedContentVersion: cycle.seed_content_version,
    stageId: stage.stage,
    phase: stage.phase as ServerPhotoContext["phase"],
    day,
    lightCondition: profile?.light_condition_slug ?? null,
    whatGoodLooksLike: stage.what_good_looks_like,
    commonProblems: Array.isArray(stage.common_problems) ? stage.common_problems.filter((value): value is string => typeof value === "string") : [],
    authoredPrompt: stage.photo_check_prompt
  };
}

function calculateCycleDay(startedAt: string, timezone: string): number {
  const ordinal = (date: Date) => {
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return Math.floor(Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day)) / 86_400_000);
  };
  return Math.max(1, ordinal(new Date()) - ordinal(new Date(startedAt)) + 1);
}

function assertOwnedStoragePath(path: string, userId: string, cycleId: string): void {
  if (!path.startsWith(`${userId}/${cycleId}/`) || path.includes("..")) throw new Error("storage_path_not_owned");
}

async function loadImageDataUrl(client: ReturnType<typeof createClient>, storagePath: string): Promise<string> {
  const { data, error } = await client.storage.from("cycle-photos").download(storagePath);
  if (error || !data) throw new Error("photo_download_failed");
  if (data.size === 0 || data.size > 10 * 1024 * 1024) throw new Error("invalid_photo_size");
  const contentType = data.type || "image/jpeg";
  if (!["image/jpeg", "image/png", "image/webp"].includes(contentType)) throw new Error("invalid_photo_type");
  const bytes = new Uint8Array(await data.arrayBuffer());
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  return `data:${contentType};base64,${btoa(binary)}`;
}

async function sha256(value: string): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function completeAndSave(client: ReturnType<typeof createClient>, requestId: string, leaseToken: string, userId: string, input: PhotoCheckRequest, result: PhotoCheckResult, usage: {
  inputTokens: number; cachedInputTokens: number; outputTokens: number; costEstimate: number; latencyMs: number; attemptCount: number; providerRequestId: string | null; errorCode: string | null;
}): Promise<string> {
  const { data, error } = await client.rpc("complete_ai_photo_check", {
    p_request_id: requestId,
    p_lease_token: leaseToken,
    p_user_id: userId,
    p_check_type: input.checkType,
    p_storage_path: input.storagePath,
    p_result: result,
    p_occurred_at: new Date().toISOString(),
    p_input_tokens: usage.inputTokens,
    p_cached_input_tokens: usage.cachedInputTokens,
    p_output_tokens: usage.outputTokens,
    p_cost_estimate_usd: usage.costEstimate,
    p_latency_ms: usage.latencyMs,
    p_attempt_count: usage.attemptCount,
    p_provider_request_id: usage.providerRequestId,
    p_error_code: usage.errorCode
  });
  if (error) throw new Error(`photo_check_persistence_failed:${error.code ?? "unknown"}`);
  const checkId = String((data as { id?: string } | null)?.id ?? "");
  if (!checkId) throw new Error("photo_check_id_missing");
  return checkId;
}

function providerFailureResult(errorCode: string): PhotoCheckResult {
  return {
    status: "provider_error", confidence: "unknown", headline: "We could not check this photo",
    explanation: "The photo-check service is temporarily unavailable. Your cycle is safe and this attempt will not use an allowance.",
    actions: ["Try the same photo again in a few minutes."],
    retakeGuidance: "You do not need to take another photo unless you want to.",
    promptVersion: PROMPT_VERSION, modelVersion: "unavailable", costEstimate: 0
  };
}

function safeErrorCode(error: unknown): string {
  if (!(error instanceof Error)) return "provider_error";
  if (error.name === "ZodError" || error instanceof SyntaxError) return "invalid_request";
  const known = ["active_cycle_not_found", "storage_path_not_owned", "photo_download_failed", "invalid_photo_size", "invalid_photo_type", "authored_context_unavailable"];
  return known.find((code) => error.message.includes(code)) ?? "provider_error";
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" } });
}
