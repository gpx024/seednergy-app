import { createClient } from "@supabase/supabase-js";
import { collectStoragePaths } from "./storage.ts";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const bucketName = "cycle-photos";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) return json({ error: "authentication_required", message: "Log in before deleting your account." }, 401);
    const env = readEnvironment();
    const userClient = createClient(env.supabaseUrl, env.anonKey, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false } });
    const { data: authData, error: authError } = await userClient.auth.getUser();
    if (authError || !authData.user) return json({ error: "authentication_required", message: "Your session has expired. Log in and try again." }, 401);

    const serviceClient = createClient(env.supabaseUrl, env.serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const paths = await listFilesRecursively(serviceClient, authData.user.id);
    for (let index = 0; index < paths.length; index += 100) {
      const { error } = await serviceClient.storage.from(bucketName).remove(paths.slice(index, index + 100));
      if (error) throw new Error(`storage_delete_failed:${error.message}`);
    }
    const remaining = await listFilesRecursively(serviceClient, authData.user.id);
    if (remaining.length > 0) throw new Error("storage_delete_incomplete");

    const { error: databaseError } = await serviceClient.rpc("finalize_account_deletion", { p_user_id: authData.user.id });
    if (databaseError) throw new Error(`database_delete_failed:${databaseError.code ?? "unknown"}`);
    const { error: userError } = await serviceClient.auth.admin.deleteUser(authData.user.id);
    if (userError && !userError.message.toLowerCase().includes("not found")) throw new Error(`auth_delete_failed:${userError.message}`);

    console.info(JSON.stringify({ event: "account_deleted", deletedObjectCount: paths.length }));
    return json({ deleted: true });
  } catch (error) {
    const code = safeCode(error);
    console.error(JSON.stringify({ event: "account_deletion_failed", errorCode: code }));
    return json({
      error: code,
      message: "We could not finish deleting the account. You can safely try again. Contact support if the problem continues.",
    }, 503);
  }
});

function readEnvironment() {
  const required = (name: string) => { const value = Deno.env.get(name); if (!value) throw new Error(`missing_${name.toLowerCase()}`); return value; };
  return { supabaseUrl: required("SUPABASE_URL"), anonKey: required("SUPABASE_ANON_KEY"), serviceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY") };
}

async function listFilesRecursively(client: ReturnType<typeof createClient>, prefix: string): Promise<string[]> {
  return collectStoragePaths(prefix, async (currentPrefix, offset) => {
    const { data, error } = await client.storage.from(bucketName).list(currentPrefix, { limit: 100, offset, sortBy: { column: "name", order: "asc" } });
    if (error) throw new Error(`storage_list_failed:${error.message}`);
    return (data ?? []).map((entry) => ({ id: entry.id, name: entry.name }));
  });
}

function safeCode(error: unknown): string {
  if (!(error instanceof Error)) return "account_deletion_failed";
  return ["storage_delete_failed","storage_delete_incomplete","database_delete_failed","auth_delete_failed"].find((value) => error.message.startsWith(value)) ?? "account_deletion_failed";
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" } });
}
