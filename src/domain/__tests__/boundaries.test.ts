import { readFileSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";
import { describe, expect, it } from "vitest";

const domainRoot = join(process.cwd(), "src", "domain");
const forbiddenImports = ["react", "react-native", "expo", "@supabase", "axios", "fetch"];

describe("domain layer boundaries", () => {
  it("has no UI, Expo, backend or network imports in production domain files", () => {
    const files = readdirSync(domainRoot).filter((file) => extname(file) === ".ts" && file !== "index.ts");
    const violations = files.flatMap((file) => {
      const source = readFileSync(join(domainRoot, file), "utf8");
      return forbiddenImports.filter((dependency) => source.includes(`from "${dependency}`)).map((dependency) => `${file}: ${dependency}`);
    });
    expect(violations).toEqual([]);
  });
});
