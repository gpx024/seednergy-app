import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, extname, resolve } from "node:path";
import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";
import { summarizeEvaluation, validateManifest } from "./stage8-eval-core.mjs";

const projectRef = process.env.SUPABASE_PROJECT_REF ?? "kvkrmazwjkjhcziawebh";
const projectUrl = `https://${projectRef}.supabase.co`;
const { manifestPath, outputPath } = parseArguments(process.argv.slice(2));
const manifestDirectory = dirname(manifestPath);
const manifest = validateManifest(JSON.parse(await readFile(manifestPath, "utf8")));
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
if (!serviceKey || !publishableKey) throw new Error("Set SUPABASE_SERVICE_ROLE_KEY and SUPABASE_PUBLISHABLE_KEY for the evaluation process only.");

const service = createClient(projectUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
const userIds = [];
const storagePaths = [];
const results = [];

try {
  for (const evaluationCase of manifest.cases) {
    const email = `stage8-eval-${randomUUID()}@example.invalid`;
    const password = `${randomUUID()}Aa1!`;
    const created = await service.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { display_name: "Stage 8 Evaluation" } });
    if (created.error || !created.data.user) throw created.error ?? new Error(`${evaluationCase.id} evaluation user was not created.`);
    const userId = created.data.user.id;
    userIds.push(userId);
    const authClient = createClient(projectUrl, publishableKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const signedIn = await authClient.auth.signInWithPassword({ email, password });
    if (signedIn.error) throw new Error(`${evaluationCase.id} sign in failed: ${signedIn.error.message}`);
    const seedResponse = await service.from("seeds").select("id,content_version").eq("slug", evaluationCase.seedSlug).single();
    if (seedResponse.error) throw new Error(`${evaluationCase.id} seed failed: ${seedResponse.error.message}`);
    const cycleResponse = await service.from("cycles").insert({
      user_id: userId,
      seed_id: seedResponse.data.id,
      seed_content_version: seedResponse.data.content_version,
      status: "active",
      started_at: startedAtForDay(evaluationCase.day),
      timezone: evaluationCase.timezone ?? "Europe/London"
    }).select("id").single();
    if (cycleResponse.error) throw new Error(`${evaluationCase.id} cycle failed: ${cycleResponse.error.message}`);
    const cycleId = cycleResponse.data.id;
    const updatedProfile = await service.from("profiles").update({ light_condition_slug: evaluationCase.lightCondition ?? null }).eq("id", userId);
    if (updatedProfile.error) throw new Error(`${evaluationCase.id} profile failed: ${updatedProfile.error.message}`);

    const imagePath = resolve(manifestDirectory, evaluationCase.image);
    const bytes = await readFile(imagePath);
    const storagePath = `${userId}/${cycleId}/${randomUUID()}-${basename(imagePath).replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const uploaded = await service.storage.from("cycle-photos").upload(storagePath, bytes, { contentType: contentType(imagePath), upsert: false });
    if (uploaded.error) throw new Error(`${evaluationCase.id} upload failed: ${uploaded.error.message}`);
    storagePaths.push(storagePath);

    const requestId = randomUUID();
    const invoked = await authClient.functions.invoke("photo-check", { body: { requestId, cycleId, checkType: evaluationCase.checkType, storagePath } });
    if (invoked.error) {
      const context = invoked.error.context;
      const detail = context instanceof Response ? await context.clone().text() : invoked.error.message;
      throw new Error(`${evaluationCase.id} invocation failed: ${detail}`);
    }
    const result = invoked.data?.result ?? { status: "provider_error", confidence: "unknown", headline: "Missing result", explanation: "The evaluation endpoint returned no result.", actions: [] };
    const requestLog = await service.from("ai_request_logs")
      .select("input_tokens,cached_input_tokens,output_tokens,cost_estimate_usd,latency_ms,attempt_count,quota_consumed,error_code")
      .eq("client_event_id", requestId).maybeSingle();
    if (requestLog.error) throw new Error(`${evaluationCase.id} request log failed: ${requestLog.error.message}`);
    results.push({
      id: evaluationCase.id,
      seedSlug: evaluationCase.seedSlug,
      checkType: evaluationCase.checkType,
      expectedStatuses: evaluationCase.expectedStatuses,
      actualStatus: result.status,
      confidence: result.confidence,
      headline: result.headline,
      explanation: result.explanation,
      actions: result.actions,
      retakeGuidance: result.retakeGuidance ?? null,
      promptVersion: result.promptVersion ?? null,
      modelVersion: result.modelVersion ?? null,
      inputTokens: requestLog.data?.input_tokens ?? null,
      cachedInputTokens: requestLog.data?.cached_input_tokens ?? null,
      outputTokens: requestLog.data?.output_tokens ?? null,
      costEstimateUsd: requestLog.data?.cost_estimate_usd ?? result.costEstimate ?? null,
      latencyMs: requestLog.data?.latency_ms ?? null,
      attemptCount: requestLog.data?.attempt_count ?? null,
      quotaConsumed: requestLog.data?.quota_consumed ?? null,
      errorCode: requestLog.data?.error_code ?? null,
      reviewerNotes: evaluationCase.reviewerNotes ?? null
    });
  }

  const report = summarizeEvaluation(manifest, results);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ outputPath, gate: report.gate, metrics: report.metrics, monthlyCostScenarios: report.monthlyCostScenarios }, null, 2));
  if (report.gate.status === "failed") process.exitCode = 2;
} finally {
  if (storagePaths.length > 0) await service.storage.from("cycle-photos").remove(storagePaths);
  for (const userId of userIds) {
    await service.from("cycle_events").delete().eq("user_id", userId);
    await service.from("photo_checks").delete().eq("user_id", userId);
    await service.from("ai_request_logs").delete().eq("user_id", userId);
    await service.from("cycles").delete().eq("user_id", userId);
    await service.from("profiles").delete().eq("id", userId);
    await service.auth.admin.deleteUser(userId);
  }
}

function parseArguments(args) {
  const manifestIndex = args.indexOf("--manifest");
  const outputIndex = args.indexOf("--output");
  if (manifestIndex < 0 || !args[manifestIndex + 1]) throw new Error("Pass --manifest path/to/manifest.json.");
  const manifestPath = resolve(args[manifestIndex + 1]);
  const outputPath = resolve(outputIndex >= 0 && args[outputIndex + 1] ? args[outputIndex + 1] : "reports/stage8-evaluation.json");
  return { manifestPath, outputPath };
}

function startedAtForDay(day) { return new Date(Date.now() - (day - 1) * 86_400_000).toISOString(); }
function contentType(path) {
  const extension = extname(path).toLowerCase();
  if (extension === ".png") return "image/png";
  if (extension === ".webp") return "image/webp";
  return "image/jpeg";
}
