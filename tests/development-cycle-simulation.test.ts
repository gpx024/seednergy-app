import { describe, expect, it } from "vitest";

import { startedAtForSimulatedCycleDay } from "@/src/application/cycles/developmentSimulation";
import { calculateCycleDay } from "@/src/domain";

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
});
