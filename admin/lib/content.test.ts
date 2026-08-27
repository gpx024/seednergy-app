import { describe, expect, it } from "vitest";

import { validatePublication } from "./content";

describe("CMS publication validation", () => {
  it("rejects incomplete content", () => expect(validatePublication({}, []).valid).toBe(false));
  it("reports missing stages", () => {
    const result = validatePublication({ id: crypto.randomUUID() }, []);
    expect(result.errors.length).toBeGreaterThan(1);
  });
});
