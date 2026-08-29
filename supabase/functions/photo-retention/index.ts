import { createClient } from "@supabase/supabase-js";

Deno.serve(async (request) => {
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const startedAt = new Date().toISOString();
  let runId: string | null = null;
  let client: ReturnType<typeof createClient> | null = null;
  try {
    const env = readEnvironment();
    if (request.headers.get("x-retention-secret") !== env.jobSecret) return json({ error: "unauthorized" }, 401);
    client = createClient(env.supabaseUrl, env.serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const input = await readInput(request);
    const { data: configuration, error: configurationError } = await client.from("privacy_configuration").select("check_photo_retention_days").eq("id", true).maybeSingle();
    if (configurationError) throw new Error(`configuration_read_failed:${configurationError.code}`);
    const retentionDays = input.dryRun ? input.retentionDays ?? configuration?.check_photo_retention_days : configuration?.check_photo_retention_days;
    if (input.dryRun) {
      if (!retentionDays) return json({ status: "skipped_unconfigured", message: "Provide retentionDays for a dry run, or approve and configure the legal retention period first." });
      const cutoff = new Date(Date.now() - retentionDays * 86_400_000).toISOString();
      const { count, error: countError } = await client.from("photo_checks").select("id", { count: "exact", head: true }).lte("submitted_at", cutoff);
      if (countError) throw new Error(`retention_query_failed:${countError.code}`);
      return json({ status: "dry_run", retentionDays, eligibleRecords: count ?? 0, cutoff, deletedRecords: 0, deletedObjects: 0 });
    }
    const { data: run, error: runError } = await client.from("privacy_job_runs").insert({ job_name: "photo_retention", status: retentionDays ? "running" : "skipped_unconfigured", started_at: startedAt, finished_at: retentionDays ? null : new Date().toISOString() }).select("id").single();
    if (runError) throw new Error(`run_log_failed:${runError.code}`);
    runId = run.id;
    if (!retentionDays) return json({ status: "skipped_unconfigured", message: "Photo retention remains disabled until the policy is legally approved." });

    const { error: prepareError } = await client.rpc("prepare_photo_retention", { p_retention_days: retentionDays });
    if (prepareError) throw new Error(`retention_prepare_failed:${prepareError.code}`);
    const { data: expired, error: expiredError } = await client.from("photo_checks").select("id,storage_path").not("storage_path", "is", null).lte("retention_expires_at", new Date().toISOString()).limit(500);
    if (expiredError) throw new Error(`retention_query_failed:${expiredError.code}`);
    const paths = (expired ?? []).map((row) => row.storage_path);
    for (let index = 0; index < paths.length; index += 100) {
      const { error } = await client.storage.from("cycle-photos").remove(paths.slice(index, index + 100));
      if (error) throw new Error(`retention_storage_failed:${error.message}`);
    }
    const ids = (expired ?? []).map((row) => row.id);
    if (ids.length > 0) {
      const { error } = await client.from("photo_checks").update({ storage_path: null }).in("id", ids);
      if (error) throw new Error(`retention_database_failed:${error.code}`);
    }
    await client.from("privacy_job_runs").update({ status: "completed", deleted_records: ids.length, deleted_objects: paths.length, finished_at: new Date().toISOString() }).eq("id", runId);
    return json({ status: "completed", redactedRecords: ids.length, deletedObjects: paths.length });
  } catch (error) {
    const errorCode = error instanceof Error ? error.message.split(":")[0] : "retention_failed";
    if (client && runId) await client.from("privacy_job_runs").update({ status: "failed", error_code: errorCode, finished_at: new Date().toISOString() }).eq("id", runId);
    console.error(JSON.stringify({ event: "photo_retention_failed", errorCode }));
    return json({ error: errorCode }, 503);
  }
});

function readEnvironment() {
  const required = (name: string) => { const value = Deno.env.get(name); if (!value) throw new Error(`missing_${name.toLowerCase()}`); return value; };
  return { supabaseUrl: required("SUPABASE_URL"), serviceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"), jobSecret: required("PHOTO_RETENTION_JOB_SECRET") };
}

async function readInput(request: Request): Promise<{ dryRun: boolean; retentionDays?: number }> {
  const body = await request.json().catch(() => ({})) as { dryRun?: unknown; retentionDays?: unknown };
  const dryRun = body.dryRun === true;
  if (body.retentionDays === undefined) return { dryRun };
  const retentionDays = typeof body.retentionDays === "number" ? body.retentionDays : Number.NaN;
  if (!Number.isInteger(retentionDays) || retentionDays < 1 || retentionDays > 3650) throw new Error("invalid_retention_period");
  return { dryRun, retentionDays };
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}
