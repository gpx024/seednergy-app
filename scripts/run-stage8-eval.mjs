import { readFile } from "node:fs/promises";
import { basename, extname, resolve } from "node:path";
import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";

const projectRef = "kvkrmazwjkjhcziawebh";
const projectUrl = `https://${projectRef}.supabase.co`;
const cases = process.argv.slice(2).map(parseCase);
if (cases.length === 0) throw new Error("Pass one or more cases as AI-001=path/to/photo.jpg.");

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
if (!serviceKey || !publishableKey) throw new Error("Set SUPABASE_SERVICE_ROLE_KEY and SUPABASE_PUBLISHABLE_KEY for the evaluation process only.");

const service = createClient(projectUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
const email = `stage8-eval-${randomUUID()}@example.invalid`;
const password = `${randomUUID()}Aa1!`;
let userId;
let cycleId;
const storagePaths = [];

try {
  const created = await service.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { display_name: "Stage 8 Evaluation" } });
  if (created.error || !created.data.user) throw created.error ?? new Error("Evaluation user was not created.");
  userId = created.data.user.id;

  const seedResponse = await service.from("seeds").select("id,content_version").eq("slug", "cress").single();
  if (seedResponse.error) throw seedResponse.error;
  const cycleResponse = await service.from("cycles").insert({
    user_id: userId,
    seed_id: seedResponse.data.id,
    seed_content_version: seedResponse.data.content_version,
    status: "active",
    started_at: startedAtForDay(3),
    timezone: "Europe/London"
  }).select("id").single();
  if (cycleResponse.error) throw cycleResponse.error;
  cycleId = cycleResponse.data.id;

  const authClient = createClient(projectUrl, publishableKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const signedIn = await authClient.auth.signInWithPassword({ email, password });
  if (signedIn.error) throw signedIn.error;

  for (const fixture of cases) {
    const config = fixtureConfig(fixture.id);
    const updatedCycle = await service.from("cycles").update({ started_at: startedAtForDay(config.day) }).eq("id", cycleId);
    if (updatedCycle.error) throw updatedCycle.error;
    const updatedProfile = await service.from("profiles").update({ light_condition_slug: config.light }).eq("id", userId);
    if (updatedProfile.error) throw updatedProfile.error;

    const bytes = await readFile(fixture.path);
    const storagePath = `${userId}/${cycleId}/${randomUUID()}-${basename(fixture.path).replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const uploaded = await service.storage.from("cycle-photos").upload(storagePath, bytes, { contentType: contentType(fixture.path), upsert: false });
    if (uploaded.error) throw uploaded.error;
    storagePaths.push(storagePath);

    const requestId = randomUUID();
    const invoked = await authClient.functions.invoke("photo-check", {
      body: { requestId, cycleId, checkType: config.checkType, storagePath }
    });
    if (invoked.error) {
      const context = invoked.error.context;
      const detail = context instanceof Response ? await context.clone().text() : invoked.error.message;
      throw new Error(`${fixture.id} failed: ${detail}`);
    }
    const result = invoked.data?.result;
    const persisted = invoked.data?.checkId
      ? await service.from("photo_checks").select("error_code").eq("id", invoked.data.checkId).maybeSingle()
      : { data: null };
    const requestLog = await service
      .from("ai_request_logs")
      .select("state,input_tokens,cached_input_tokens,output_tokens,cost_estimate_usd,latency_ms,attempt_count,quota_consumed,error_code")
      .eq("client_event_id", requestId)
      .maybeSingle();
    console.log(JSON.stringify({
      fixtureId: fixture.id,
      checkId: invoked.data?.checkId,
      serverErrorCode: persisted.data?.error_code ?? null,
      requestLog: requestLog.data,
      ...result
    }, null, 2));
  }
} finally {
  if (storagePaths.length > 0) await service.storage.from("cycle-photos").remove(storagePaths);
  if (userId) {
    await service.from("cycle_events").delete().eq("user_id", userId);
    await service.from("photo_checks").delete().eq("user_id", userId);
    await service.from("ai_request_logs").delete().eq("user_id", userId);
    await service.from("cycles").delete().eq("user_id", userId);
    await service.from("profiles").delete().eq("id", userId);
    await service.auth.admin.deleteUser(userId);
  }
}

function parseCase(value) {
  const separator = value.indexOf("=");
  if (separator < 1) throw new Error(`Invalid case argument: ${value}`);
  const id = value.slice(0, separator);
  if (!/^AI-00[1-6]$/.test(id)) throw new Error(`Unknown fixture ID: ${id}`);
  return { id, path: resolve(value.slice(separator + 1)) };
}

function fixtureConfig(id) {
  if (id === "AI-003") return { day: 5, light: "low", checkType: "issue" };
  if (id === "AI-004") return { day: 5, light: "bright", checkType: "issue" };
  if (id === "AI-005") return { day: 10, light: "bright", checkType: "harvest_readiness" };
  return { day: 3, light: "bright", checkType: "progress" };
}

function startedAtForDay(day) {
  return new Date(Date.now() - (day - 1) * 86_400_000).toISOString();
}

function contentType(path) {
  const extension = extname(path).toLowerCase();
  if (extension === ".png") return "image/png";
  if (extension === ".webp") return "image/webp";
  return "image/jpeg";
}
