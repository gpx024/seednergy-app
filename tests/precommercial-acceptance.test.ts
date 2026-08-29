import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const eas = JSON.parse(readFileSync(join(root, "eas.json"), "utf8"));
const paywall = readFileSync(join(root, "app", "paywall", "index.tsx"), "utf8");
const createAccount = readFileSync(join(root, "app", "(onboarding)", "create-account.tsx"), "utf8");
const notificationSettings = readFileSync(join(root, "app", "settings", "index.tsx"), "utf8");
const notificationService = readFileSync(join(root, "src", "infrastructure", "notifications", "ExpoNotificationService.ts"), "utf8");

describe("pre-commercial acceptance build", () => {
  it("removes development controls from the self-contained preview", () => {
    expect(eas.build.preview.env.EXPO_PUBLIC_APP_ENV).toBe("preview");
    expect(eas.build.preview.env.EXPO_PUBLIC_ENABLE_DEV_ROUTES).toBe("false");
  });

  it("enables approved email authentication while guarding unfinished integrations", () => {
    expect(eas.build.preview.env.EXPO_PUBLIC_ENABLE_EMAIL_AUTH).toBe("true");
    expect(eas.build.preview.env.EXPO_PUBLIC_ENABLE_PAYMENTS).toBe("false");
    expect(eas.build.preview.env.EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS).toBe("false");
    expect(createAccount).toContain("featureFlags.emailAuthentication");
    expect(notificationSettings).toContain("featureFlags.pushNotifications");
    expect(notificationService).toContain("Push notifications are not enabled in this private build.");
  });

  it("shows an honest premium boundary instead of a Stage 1 stub", () => {
    expect(paywall).not.toContain("ScreenStub");
    expect(paywall).toContain("paywall.privateBuildNote");
    expect(paywall).toContain("disabled");
  });

  it("documents the exact private acceptance path", () => {
    const acceptance = readFileSync(join(root, "docs", "PRECOMMERCIAL_ACCEPTANCE.md"), "utf8");
    expect(acceptance).toContain("Google sign-in");
    expect(acceptance).toContain("AI photo check");
    expect(acceptance).toContain("Private Garden");
    expect(acceptance).toContain("Not part of this acceptance build");
  });
});
