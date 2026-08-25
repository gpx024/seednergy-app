import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const sql = readFileSync(join(process.cwd(), "supabase", "migrations", "202608250005_stage5_seed_content.sql"), "utf8").toLowerCase();

describe("Stage 5 content migration", () => {
  it.each(["cress", "pea-shoots", "radish-microgreens", "broccoli-microgreens"])("authors %s in the database", (slug) => {
    expect(sql).toContain(`'${slug}'`);
  });

  it("includes a genuine coming-soon database preview", () => {
    expect(sql).toContain("'basil'");
    expect(sql).toContain("'coming_soon'");
  });

  it("stores expert-context and source fields needed by later stages", () => {
    expect(sql).toContain("what_good_looks_like");
    expect(sql).toContain("common_problems");
    expect(sql).toContain("content_sources");
    expect(sql).toContain("content_review_status");
  });

  it("guards incomplete active launch seeds at the database boundary", () => {
    expect(sql).toContain("validate_stage5_seed_content");
    expect(sql).toContain("active launch seed content is incomplete");
  });
});

