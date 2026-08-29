import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { parsePublicEnvironment } from "@/src/config/env";

describe("public environment configuration", () => {
  it("uses static Expo public environment references that Metro can inline", () => {
    const source = readFileSync(join(process.cwd(), "src", "config", "env.ts"), "utf8");
    expect(source).toContain("process.env.EXPO_PUBLIC_SUPABASE_URL");
    expect(source).toContain("process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
    expect(source).not.toContain("parsePublicEnvironment(process.env)");
  });

  it("uses safe development defaults", () => {
    expect(parsePublicEnvironment({})).toEqual({
      EXPO_PUBLIC_APP_ENV: "development",
      EXPO_PUBLIC_ENABLE_DEV_ROUTES: true,
      EXPO_PUBLIC_ENABLE_EMAIL_AUTH: false,
      EXPO_PUBLIC_ENABLE_PAYMENTS: false,
      EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS: false,
      EXPO_PUBLIC_ENABLE_MONITORING_VERIFICATION: false,
      EXPO_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
      EXPO_PUBLIC_ENABLE_APPLE_AUTH: false,
      EXPO_PUBLIC_PHOTO_CHECK_PROVIDER: "live",
      EXPO_PUBLIC_PRIVACY_POLICY_URL: "",
      EXPO_PUBLIC_TERMS_URL: "",
      EXPO_PUBLIC_SUPPORT_URL: "",
      EXPO_PUBLIC_SENTRY_DSN: ""
    });
  });

  it("rejects an invalid public environment", () => {
    expect(() => parsePublicEnvironment({ EXPO_PUBLIC_APP_ENV: "invalid" })).toThrow();
  });

  it("parses the public Supabase and provider flags", () => {
    expect(parsePublicEnvironment({ EXPO_PUBLIC_SUPABASE_URL: "https://project.supabase.co", EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example", EXPO_PUBLIC_ENABLE_APPLE_AUTH: "true", EXPO_PUBLIC_ENABLE_EMAIL_AUTH: "true", EXPO_PUBLIC_ENABLE_PAYMENTS: "true", EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS: "true", EXPO_PUBLIC_PHOTO_CHECK_PROVIDER: "fixture" })).toMatchObject({
      EXPO_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
      EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
      EXPO_PUBLIC_ENABLE_APPLE_AUTH: true,
      EXPO_PUBLIC_ENABLE_EMAIL_AUTH: true,
      EXPO_PUBLIC_ENABLE_PAYMENTS: true,
      EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS: true,
      EXPO_PUBLIC_PHOTO_CHECK_PROVIDER: "fixture"
    });
  });
});
