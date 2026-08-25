import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migrationRoot = join(process.cwd(), "supabase", "migrations");
const migrationFiles = readdirSync(migrationRoot).filter((file) => file.endsWith(".sql")).sort();
const sql = migrationFiles.map((file) => readFileSync(join(migrationRoot, file), "utf8")).join("\n").toLowerCase();

const applicationTables = [
  "profiles", "seed_categories", "environments", "light_conditions", "difficulty_levels", "equipment_items", "use_categories", "check_types",
  "seeds", "seed_stages", "cycles", "cycle_events", "photo_checks", "entitlements", "notifications"
];

describe("Stage 4 Supabase schema", () => {
  it.each(applicationTables)("creates %s with row-level security", (table) => {
    expect(sql).toContain(`create table public.${table}`);
    const explicitRls = sql.includes(`alter table public.${table} enable row level security`);
    const loopedRls = sql.includes("foreach table_name") && sql.includes(`'${table}'`);
    expect(explicitRls || loopedRls).toBe(true);
  });

  it("forces cycle creation through the atomic start_cycle function", () => {
    expect(sql).toContain("security definer");
    expect(sql).toContain("'cycle_started'");
    expect(sql).not.toContain("grant insert on public.cycles to authenticated");
  });

  it("makes cycle events append-only", () => {
    expect(sql).toContain("cycle_events is append-only");
    expect(sql).toContain("cycle_events_reject_update");
    expect(sql).toContain("cycle_events_reject_delete");
    expect(sql).not.toContain("grant update on public.cycle_events");
    expect(sql).not.toContain("grant delete on public.cycle_events");
  });

  it("creates a private user-scoped photo bucket", () => {
    expect(sql).toContain("'cycle-photos', 'cycle-photos', false");
    expect(sql).toContain("(storage.foldername(name))[1] = auth.uid()::text");
  });
});
