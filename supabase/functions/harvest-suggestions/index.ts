import { createClient } from "@supabase/supabase-js";

const PROMPT_VERSION = "seednergy-harvest-uses-v1";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

Deno.serve(async (request) => {
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return json({ error: "authentication_required" }, 401);
  const url = required("SUPABASE_URL");
  const publishableKey = required("SUPABASE_ANON_KEY");
  const serviceRoleKey = required("SUPABASE_SERVICE_ROLE_KEY");
  const userClient = createClient(url, publishableKey, { global: { headers: { Authorization: authorization } } });
  const { data: authData, error: authError } = await userClient.auth.getUser();
  if (authError || !authData.user) return json({ error: "authentication_required" }, 401);

  let harvestId = "";
  try { harvestId = String((await request.json()).harvestId ?? ""); } catch { return json({ error: "invalid_request" }, 400); }
  if (!UUID.test(harvestId)) return json({ error: "invalid_request" }, 400);
  const service = createClient(url, serviceRoleKey, { auth: { persistSession: false } });
  const { data: harvest, error: harvestError } = await service.from("harvests").select("*").eq("id", harvestId).eq("user_id", authData.user.id).maybeSingle();
  if (harvestError || !harvest) return json({ error: "harvest_not_found" }, 404);
  if (harvest.suggestion_status === "completed" || harvest.suggestion_status === "fallback") return json({ harvest });
  const { data: seed, error: seedError } = await service.from("seeds").select("name,taste_profile,storage_guidance").eq("id", harvest.seed_id).single();
  if (seedError || !seed) return json({ error: "seed_not_found" }, 404);
  const { data: profile } = await service.from("profiles").select("timezone").eq("id", authData.user.id).single();
  const harvestedAt = new Date(harvest.harvested_at);
  const context = {
    seed: seed.name,
    harvestDate: harvestedAt.toISOString().slice(0, 10),
    dayOfWeek: harvestedAt.toLocaleDateString("en-GB", { weekday: "long", timeZone: profile?.timezone ?? "UTC" }),
    season: seasonFor(harvestedAt, profile?.timezone ?? "UTC"),
    tasteProfile: seed.taste_profile,
    storageGuidance: seed.storage_guidance
  };

  const startedAt = Date.now();
  try {
    const generated = await generate(context);
    const { data: updated, error } = await service.from("harvests").update({
      suggestions: generated.result,
      suggestion_status: "completed",
      prompt_version: PROMPT_VERSION,
      model_version: generated.model,
      cost_estimate_usd: generated.cost,
      latency_ms: Date.now() - startedAt
    }).eq("id", harvest.id).eq("user_id", authData.user.id).select("*").single();
    if (error) throw error;
    await service.from("cycle_events").insert({
      cycle_id: harvest.cycle_id,
      user_id: authData.user.id,
      event_type: "harvest_suggestions_generated",
      payload: { harvest_id: harvest.id, source: "ai", prompt_version: PROMPT_VERSION },
      occurred_at: new Date().toISOString(),
      client_event_id: crypto.randomUUID()
    });
    console.info(JSON.stringify({ event: "harvest_suggestions_completed", harvestId: harvest.id, model: generated.model, costEstimateUsd: generated.cost, latencyMs: Date.now() - startedAt }));
    return json({ harvest: updated });
  } catch (error) {
    const fallback = fallbackSuggestions(seed.name, seed.taste_profile, context.dayOfWeek);
    const { data: updated, error: updateError } = await service.from("harvests").update({
      suggestions: fallback,
      suggestion_status: "fallback",
      prompt_version: PROMPT_VERSION,
      model_version: "fallback-v1",
      cost_estimate_usd: 0,
      latency_ms: Date.now() - startedAt
    }).eq("id", harvest.id).eq("user_id", authData.user.id).select("*").single();
    if (updateError) return json({ error: "suggestions_unavailable" }, 503);
    console.error(JSON.stringify({ event: "harvest_suggestions_fallback", harvestId: harvest.id, errorCode: errorCode(error), latencyMs: Date.now() - startedAt }));
    return json({ harvest: updated });
  }
});

async function generate(context: Record<string, string>) {
  const model = Deno.env.get("OPENAI_MODEL") ?? "gpt-5.6-luna";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${required("OPENAI_API_KEY")}`, "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        store: false,
        reasoning: { effort: "low" },
        instructions: "You are Seednergy's calm post-harvest coach. Return 3 to 5 short, specific ways to use the harvested seed today or very soon. Never return full recipes, quantities, health claims, food-safety guarantees, shopping lists, or generic congratulations. Keep each description under 30 words.",
        input: JSON.stringify(context),
        text: { format: { type: "json_schema", name: "harvest_uses", strict: true, schema: {
          type: "object", additionalProperties: false, required: ["headline","ideas"], properties: {
            headline: { type: "string", minLength: 1, maxLength: 90 },
            ideas: { type: "array", minItems: 3, maxItems: 5, items: { type: "object", additionalProperties: false, required: ["title","description"], properties: {
              title: { type: "string", minLength: 1, maxLength: 60 }, description: { type: "string", minLength: 1, maxLength: 180 }
            } } }
          }
        } } }
      })
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(`provider_${response.status}_${payload?.error?.code ?? "unknown"}`);
    const output = payload.output?.flatMap((item: { content?: unknown[] }) => item.content ?? []).find((item: { type?: string }) => item.type === "output_text")?.text;
    if (!output) throw new Error("provider_output_missing");
    const parsed = JSON.parse(output);
    if (!Array.isArray(parsed.ideas) || parsed.ideas.length < 3 || parsed.ideas.length > 5) throw new Error("provider_output_invalid");
    const usage = payload.usage ?? {};
    const inputTokens = Number(usage.input_tokens ?? 0); const cached = Number(usage.input_tokens_details?.cached_tokens ?? 0); const outputTokens = Number(usage.output_tokens ?? 0);
    const cost = Number((((inputTokens - cached) * 0.2 + cached * 0.02 + outputTokens * 1.2) / 1_000_000).toFixed(8));
    return { result: parsed, model: String(payload.model ?? model), cost };
  } finally { clearTimeout(timeout); }
}

function seasonFor(date: Date, timezone: string) {
  const month = Number(new Intl.DateTimeFormat("en", { month: "numeric", timeZone: timezone }).format(date));
  const southern = /(Australia|Pacific\/Auckland|Africa\/Johannesburg|America\/(Argentina|Santiago))/i.test(timezone);
  const northern = month === 12 || month <= 2 ? "winter" : month <= 5 ? "spring" : month <= 8 ? "summer" : "autumn";
  return southern ? ({ winter: "summer", spring: "autumn", summer: "winter", autumn: "spring" } as const)[northern] : northern;
}

function fallbackSuggestions(seed: string, taste: string, day: string) {
  return { headline: `Three simple ways to enjoy your ${seed.toLowerCase()} this ${day}`, ideas: [
    { title: "Finish a savoury plate", description: `Scatter it over eggs, toast, soup, or a grain bowl for its ${taste.toLowerCase()} character.` },
    { title: "Add it at the last moment", description: "Fold it through a salad or sandwich just before serving so the fresh texture stays present." },
    { title: "Keep tomorrow's portion", description: "Store it as authored for this seed and use the remaining harvest promptly." }
  ] };
}

function required(name: string) { const value = Deno.env.get(name); if (!value) throw new Error(`missing_${name.toLowerCase()}`); return value; }
function errorCode(error: unknown) { return error instanceof DOMException && error.name === "AbortError" ? "provider_timeout" : error instanceof Error ? error.message.slice(0, 80) : "unknown"; }
function json(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }); }
