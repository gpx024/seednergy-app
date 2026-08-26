import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");
const edge = read("supabase/functions/photo-check/index.ts");
const openAI = read("supabase/functions/photo-check/openai.ts");
const prompt = read("supabase/functions/photo-check/prompt.ts");
const migration = `${read("supabase/migrations/202608260009_stage8_ai_quota.sql")}\n${read("supabase/migrations/202608260010_stage8_server_persistence.sql")}`.toLowerCase();
const client = read("src/infrastructure/ai/SupabasePhotoCheckProvider.ts");

describe("Stage 8 real AI boundary", () => {
  it("keeps the provider credential server-side only", () => {
    expect(edge).toContain('value("OPENAI_API_KEY")');
    for (const mobilePath of ["app", "src", "assets"]) {
      expect(allFilesUnder(mobilePath).join("\n")).not.toContain("OPENAI_API_KEY");
    }
  });

  it("calls the Responses API with image input, structured output, and disabled storage", () => {
    expect(openAI).toContain("https://api.openai.com/v1/responses");
    expect(openAI).toContain('type: "input_image"');
    expect(openAI).toContain('type: "json_schema"');
    expect(openAI).toContain("store: false");
  });

  it("uses versioned, cycle-specific server prompt context and safety rules", () => {
    expect(prompt).toContain("seednergy-photo-check-v1");
    expect(prompt).toContain("Current cycle day");
    expect(prompt).toContain("Authored common problems");
    expect(prompt).toContain("Never give chemical treatment instructions");
    expect(edge).toContain("loadServerContext");
  });

  it("implements one retry, a timeout, and a recoverable provider error", () => {
    expect(openAI).toContain("MAX_ATTEMPTS = 2");
    expect(openAI).toContain("REQUEST_TIMEOUT_MS");
    expect(openAI).toContain("AbortController");
    expect(edge).toContain('status: "provider_error"');
  });

  it("enforces quota atomically without charging unclear, rejected, or failed checks", () => {
    expect(migration).toContain("pg_advisory_xact_lock");
    expect(migration).toContain("ai_quota_exceeded");
    expect(migration).toContain("not in ('unclear','rejected','provider_error')");
    expect(migration).toContain("cost_estimate_usd");
    expect(migration).toContain("latency_ms");
    expect(migration).toContain("function public.complete_ai_photo_check");
    expect(migration).toContain("grant execute on function public.complete_ai_photo_check");
  });

  it("keeps the fake provider selectable while the live adapter invokes the Edge Function", () => {
    expect(client).toContain('functions.invoke("photo-check"');
    expect(read("src/infrastructure/ai/FixturePhotoCheckProvider.ts")).toContain("implements PhotoCheckProvider");
    expect(read("src/config/env.ts")).toContain('z.enum(["live", "fixture"])');
  });
});

function allFilesUnder(relativePath: string): string[] {
  const root = join(process.cwd(), relativePath);
  const contents: string[] = [];
  for (const name of readdirSync(root)) {
    const path = join(root, name);
    if (statSync(path).isDirectory()) contents.push(...allFilesUnder(join(relativePath, name)));
    else if (/\.(ts|tsx|js|jsx|json)$/.test(name)) contents.push(readFileSync(path, "utf8"));
  }
  return contents;
}
