import { describe, expect, it } from "vitest";

import { parsePublicEnvironment } from "@/src/config/env";

describe("public environment configuration", () => {
  it("uses safe development defaults", () => {
    expect(parsePublicEnvironment({})).toEqual({
      EXPO_PUBLIC_APP_ENV: "development",
      EXPO_PUBLIC_ENABLE_DEV_ROUTES: true
    });
  });

  it("rejects an invalid public environment", () => {
    expect(() => parsePublicEnvironment({ EXPO_PUBLIC_APP_ENV: "invalid" })).toThrow();
  });
});
