import { describe, expect, it } from "vitest";

import { parsePublicEnvironment } from "@/src/config/env";

describe("public environment configuration", () => {
  it("uses safe development defaults", () => {
    expect(parsePublicEnvironment({})).toEqual({
      EXPO_PUBLIC_APP_ENV: "development",
      EXPO_PUBLIC_ENABLE_DEV_ROUTES: true,
      EXPO_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
      EXPO_PUBLIC_ENABLE_APPLE_AUTH: false
    });
  });

  it("rejects an invalid public environment", () => {
    expect(() => parsePublicEnvironment({ EXPO_PUBLIC_APP_ENV: "invalid" })).toThrow();
  });

  it("parses the public Supabase and provider flags", () => {
    expect(parsePublicEnvironment({ EXPO_PUBLIC_SUPABASE_URL: "https://project.supabase.co", EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example", EXPO_PUBLIC_ENABLE_APPLE_AUTH: "true" })).toMatchObject({
      EXPO_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
      EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
      EXPO_PUBLIC_ENABLE_APPLE_AUTH: true
    });
  });
});
