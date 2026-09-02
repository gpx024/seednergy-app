import { describe, expect, it } from "vitest";

import { startedAtForSimulatedCycleDay } from "@/src/application/cycles/developmentSimulation";
import { calculateCycleDay } from "@/src/domain";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("development cycle simulation", () => {
  it("creates a start date that evaluates to the requested cycle day", () => {
    const now = new Date("2026-08-26T12:00:00.000Z");
    const startedAt = startedAtForSimulatedCycleDay(13, now);
    expect(calculateCycleDay(startedAt, now, "Europe/London")).toBe(13);
  });

  it("rejects invalid simulated days", () => {
    expect(() => startedAtForSimulatedCycleDay(0)).toThrow("positive whole number");
    expect(() => startedAtForSimulatedCycleDay(1.5)).toThrow("positive whole number");
  });

  it("allows the simulator in non-production internal builds only", () => {
    const source = readFileSync(join(process.cwd(), "src/config/features.ts"), "utf8");
    expect(source).toContain('environment.EXPO_PUBLIC_APP_ENV !== "production"');
    expect(source).toContain("environment.EXPO_PUBLIC_ENABLE_DEV_ROUTES");
  });

  it("keeps one harvest-ready acceptance cycle available in preview builds only", () => {
    const features = readFileSync(join(process.cwd(), "src/config/features.ts"), "utf8");
    const resource = readFileSync(join(process.cwd(), "src/presentation/cycles/useCycleData.ts"), "utf8");
    expect(features).toContain('prelaunchHarvestDemo: environment.EXPO_PUBLIC_APP_ENV === "preview"');
    expect(resource).toContain('view.priority === "harvest_ready"');
    expect(resource).toContain('eventType: "prelaunch_harvest_demo_created"');
  });
});
