import { describe, expect, it } from "vitest";

import { validatePublication } from "./content";
import { addPrimarySeedImage, getSeedContentStoragePath, makePrimarySeedImage, removeSeedImage, type CmsSeedImage } from "./seedImages";

describe("CMS publication validation", () => {
  it("rejects incomplete content", () => expect(validatePublication({}, []).valid).toBe(false));
  it("reports missing stages", () => {
    const result = validatePublication({ id: crypto.randomUUID() }, []);
    expect(result.errors.length).toBeGreaterThan(1);
  });
});

describe("CMS seed image management", () => {
  const images: CmsSeedImage[] = [
    { kind: "bundled", key: "basil" },
    { kind: "remote", url: "https://example.supabase.co/storage/v1/object/public/seed-content/basil/old.jpg" }
  ];

  it("makes a new upload the primary app image", () => {
    const next = addPrimarySeedImage(images, "https://example.supabase.co/storage/v1/object/public/seed-content/basil/new.jpg");
    expect(next[0]).toEqual({ kind: "remote", url: "https://example.supabase.co/storage/v1/object/public/seed-content/basil/new.jpg" });
  });

  it("reorders and removes image references without mutating the input", () => {
    expect(makePrimarySeedImage(images, 1)[0]).toEqual(images[1]);
    expect(removeSeedImage(images, 0)).toEqual([images[1]]);
    expect(images).toHaveLength(2);
  });

  it("extracts only safe seed-content storage paths", () => {
    expect(getSeedContentStoragePath("https://example.supabase.co/storage/v1/object/public/seed-content/basil/new%20photo.jpg")).toBe("basil/new photo.jpg");
    expect(getSeedContentStoragePath("https://example.com/other.jpg")).toBeNull();
  });
});
