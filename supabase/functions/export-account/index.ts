import { createClient } from "@supabase/supabase-js";

const headers = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Content-Type": "application/json", "Cache-Control": "no-store" };

Deno.serve(async (request) => {
  try {
    if (request.method === "OPTIONS") return new Response("ok", { headers });
    if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
    const authorization = request.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) return json({ error: "authentication_required" }, 401);
    const url = Deno.env.get("SUPABASE_URL"); const anon = Deno.env.get("SUPABASE_ANON_KEY"); const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !anon || !serviceRole) return json({ error: "configuration_unavailable" }, 503);
    const userClient = createClient(url, anon, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false } });
    const { data: authData } = await userClient.auth.getUser();
    if (!authData.user) return json({ error: "authentication_required" }, 401);
    const client = createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });
    const userId = authData.user.id;
    const tables = ["profiles", "cycles", "cycle_events", "photo_checks", "harvests", "notifications", "analytics_events", "entitlements", "ai_request_logs", "push_devices"] as const;
    const entries = await Promise.all(tables.map(async (table) => {
      const { data, error } = await client.from(table).select("*").eq(table === "profiles" ? "id" : "user_id", userId);
      if (error) throw new Error(`export_${table}_failed`);
      return [table, sanitizeRows(data ?? [])] as const;
    }));
    return json({ generatedAt: new Date().toISOString(), account: { email: authData.user.email ?? null, createdAt: authData.user.created_at }, data: Object.fromEntries(entries), note: "Private image binaries, storage locations, device tokens and internal provider identifiers are not included. Stored images can be removed in the app." });
  } catch {
    return json({ error: "account_export_failed", message: "Your data export could not be created. Please try again." }, 503);
  }
});

const privateFields = new Set(["storage_path", "avatar_path", "expo_push_token", "lease_token", "provider_request_id"]);
function sanitizeRows(rows: Record<string, unknown>[]) { return rows.map((row) => Object.fromEntries(Object.entries(row).filter(([key]) => !privateFields.has(key)))); }
function json(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers }); }
