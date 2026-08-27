import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const appConfig = JSON.parse(fs.readFileSync(path.join(root, "app.json"), "utf8"));
const easConfig = JSON.parse(fs.readFileSync(path.join(root, "eas.json"), "utf8"));
const easIgnore = fs.readFileSync(path.join(root, ".easignore"), "utf8").split(/\r?\n/);

describe("Stage 12 store preparation", () => {
  it("uses stable package identifiers and explicit store build versions", () => {
    expect(appConfig.expo.ios.bundleIdentifier).toBe("com.seednergy.app");
    expect(appConfig.expo.android.package).toBe("com.seednergy.app");
    expect(appConfig.expo.ios.buildNumber).toBe("2");
    expect(appConfig.expo.android.versionCode).toBe(2);
  });

  it("configures approved raster icon and splash assets", () => {
    const assets = [
      appConfig.expo.icon,
      appConfig.expo.android.adaptiveIcon.foregroundImage,
      appConfig.expo.android.adaptiveIcon.monochromeImage,
    ];
    const splash = appConfig.expo.plugins.find((entry: unknown) => Array.isArray(entry) && entry[0] === "expo-splash-screen");
    expect(splash?.[1].backgroundColor).toBe("#eeece7");
    assets.push(splash?.[1].image);

    for (const asset of assets) {
      const absolute = path.join(root, asset.replace(/^\.\//, ""));
      expect(fs.existsSync(absolute), asset).toBe(true);
      expect(fs.statSync(absolute).size, asset).toBeGreaterThan(1_000);
    }
  });

  it("separates installable previews from store production artifacts", () => {
    expect(easConfig.build.preview.distribution).toBe("internal");
    expect(easConfig.build.preview.android.buildType).toBe("apk");
    expect(easConfig.build.production.android.buildType).toBe("app-bundle");
    expect(easConfig.build.production.developmentClient).not.toBe(true);
  });

  it("keeps the runtime Supabase client in EAS archives", () => {
    expect(easIgnore).toContain("/supabase/");
    expect(easIgnore).not.toContain("supabase/");
    expect(fs.existsSync(path.join(root, "src", "infrastructure", "supabase", "client.ts"))).toBe(true);
  });

  it("keeps microphone access disabled and documents the submission inventory", () => {
    const imagePicker = appConfig.expo.plugins.find((entry: unknown) => Array.isArray(entry) && entry[0] === "expo-image-picker");
    expect(imagePicker?.[1].microphonePermission).toBe(false);
    expect(fs.readFileSync(path.join(root, "docs", "STORE_SUBMISSION_STAGE12.md"), "utf8")).toContain("Current data inventory");
  });
});
