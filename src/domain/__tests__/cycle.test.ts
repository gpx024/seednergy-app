import { describe, expect, it } from "vitest";

import { applyCycleCommand, calculateCycleDay, createCycle, CycleDomainError, evaluateCycle, TestClock, validateSeedCycleDefinition, type CycleCommand, type CycleState, type CycleStatus, type SeedCycleDefinition } from "../index";

const cressDefinition: SeedCycleDefinition = {
  seedId: "cress",
  contentVersion: 1,
  harvestMode: "single",
  stages: [
    { id: "setup", phase: "setup", dayFrom: 1, dayTo: 1, nextActionId: "cress.setup", actionIntervalDays: 1 },
    { id: "germination", phase: "growth", dayFrom: 2, dayTo: 3, nextActionId: "cress.germination", actionIntervalDays: 1 },
    { id: "growth", phase: "growth", dayFrom: 4, dayTo: 9, nextActionId: "cress.growth", actionIntervalDays: 1 },
    { id: "pre_harvest", phase: "growth", dayFrom: 10, dayTo: 12, nextActionId: "cress.preHarvest", actionIntervalDays: 1 },
    { id: "harvest", phase: "harvest", dayFrom: 13, dayTo: 14, nextActionId: "cress.harvest", actionIntervalDays: 1, harvestReady: true }
  ]
};

function cressCycle(overrides: Partial<CycleState> = {}): CycleState {
  return {
    ...createCycle({ id: "cycle-1", seedId: "cress", seedContentVersion: 1, startedAt: "2026-08-01T09:00:00.000Z", timezone: "Europe/London" }),
    ...overrides
  };
}

describe("Seednergy cycle engine", () => {
  it("moves a Cress cycle through five internal stages and three simple phases", () => {
    const clock = new TestClock("2026-08-01T09:00:00.000Z");
    const expected = [
      { day: 1, stage: "setup", phase: "setup" },
      { day: 2, stage: "germination", phase: "growth" },
      { day: 4, stage: "growth", phase: "growth" },
      { day: 10, stage: "pre_harvest", phase: "growth" },
      { day: 13, stage: "harvest", phase: "harvest" }
    ];

    for (const item of expected) {
      clock.set(`2026-08-${String(item.day).padStart(2, "0")}T09:00:00.000Z`);
      const evaluation = evaluateCycle({ cycle: cressCycle(), definition: cressDefinition, clock });
      expect(evaluation.cycleDay).toBe(item.day);
      expect(evaluation.stage.id).toBe(item.stage);
      expect(evaluation.phase).toBe(item.phase);
    }
  });

  it("recovers normally when a user returns after seven days away", () => {
    const clock = new TestClock("2026-08-08T09:00:00.000Z");
    const evaluation = evaluateCycle({ cycle: cressCycle({ currentStageId: "setup", lastActionAt: "2026-08-01T10:00:00.000Z" }), definition: cressDefinition, clock });

    expect(evaluation.cycleDay).toBe(8);
    expect(evaluation.stage.id).toBe("growth");
    expect(evaluation.stageTransitioned).toBe(true);
    expect(evaluation.needsCheck).toBe(true);
    expect(evaluation.actionState).toBe("due");
    expect(evaluation.nextActionId).toBe("cress.growth");
  });

  it("counts Day 1 from the local start date across midnight", () => {
    expect(calculateCycleDay("2026-08-24T22:00:00.000Z", "2026-08-25T00:00:00.000Z", "Europe/London")).toBe(2);
    expect(calculateCycleDay("2026-08-24T22:00:00.000Z", "2026-08-24T22:59:59.000Z", "Europe/London")).toBe(1);
  });

  it("returns identical output for identical input", () => {
    const clock = new TestClock("2026-08-06T09:00:00.000Z");
    const input = { cycle: cressCycle(), definition: cressDefinition, clock };
    expect(evaluateCycle(input)).toEqual(evaluateCycle(input));
  });

  it("runs a complete 14-day Cress cycle in milliseconds", () => {
    const clock = new TestClock("2026-08-01T09:00:00.000Z");
    const observedStages: string[] = [];

    for (let day = 1; day <= 14; day += 1) {
      const evaluation = evaluateCycle({ cycle: cressCycle(), definition: cressDefinition, clock });
      observedStages.push(evaluation.stage.id);
      clock.advanceDays(1);
    }

    expect(new Set(observedStages)).toEqual(new Set(["setup", "germination", "growth", "pre_harvest", "harvest"]));
    const harvestClock = new TestClock("2026-08-13T09:00:00.000Z");
    const evaluation = evaluateCycle({ cycle: cressCycle(), definition: cressDefinition, clock: harvestClock });
    const ready = applyCycleCommand(cressCycle(), cressDefinition, "mark_harvest_ready", harvestClock.now().toISOString(), evaluation.harvestReady);
    const harvested = applyCycleCommand(ready, cressDefinition, "mark_harvested", harvestClock.now().toISOString(), true);

    expect(evaluation.status).toBe("harvest_ready");
    expect(harvested.status).toBe("harvested");
    expect(harvested.harvestCount).toBe(1);
  });

  it("keeps repeating-harvest cycles active after each harvest", () => {
    const repeatingDefinition = { ...cressDefinition, harvestMode: "repeating" as const };
    const ready = cressCycle({ status: "harvest_ready" });
    const harvested = applyCycleCommand(ready, repeatingDefinition, "mark_harvested", "2026-08-13T09:00:00.000Z", true);

    expect(harvested.status).toBe("active");
    expect(harvested.harvestCount).toBe(1);
    expect(harvested.lastHarvestedAt).toBe("2026-08-13T09:00:00.000Z");
    expect(harvested.harvestedAt).toBeNull();
    expect(evaluateCycle({ cycle: harvested, definition: repeatingDefinition, clock: new TestClock("2026-08-13T18:00:00.000Z") }).status).toBe("active");
    expect(evaluateCycle({ cycle: harvested, definition: repeatingDefinition, clock: new TestClock("2026-08-14T09:00:00.000Z") }).status).toBe("harvest_ready");
  });

  it("rejects every invalid status transition as a recoverable domain error", () => {
    const valid: Record<CycleStatus, readonly CycleCommand[]> = {
      active: ["archive", "mark_harvest_ready"],
      harvest_ready: ["archive", "mark_harvested"],
      harvested: ["archive"],
      archived: []
    };
    const commands: readonly CycleCommand[] = ["archive", "mark_harvest_ready", "mark_harvested"];

    for (const status of Object.keys(valid) as CycleStatus[]) {
      for (const command of commands.filter((candidate) => !valid[status].includes(candidate))) {
        expect(() => applyCycleCommand(cressCycle({ status }), cressDefinition, command, "2026-08-13T09:00:00.000Z", true)).toThrowError(CycleDomainError);
        try {
          applyCycleCommand(cressCycle({ status }), cressDefinition, command, "2026-08-13T09:00:00.000Z", true);
        } catch (error) {
          expect(error).toMatchObject({ code: "INVALID_STATUS_TRANSITION", recoverable: true });
        }
      }
    }
  });

  it("rejects harvest readiness before the harvest stage", () => {
    expect(() => applyCycleCommand(cressCycle(), cressDefinition, "mark_harvest_ready", "2026-08-03T09:00:00.000Z", false)).toThrowError(expect.objectContaining({ code: "NOT_HARVEST_READY" }));
  });

  it("accepts variable-length stage definitions and rejects malformed timelines", () => {
    const compactDefinition: SeedCycleDefinition = {
      seedId: "compact",
      contentVersion: 1,
      harvestMode: "single",
      stages: [
        { id: "start", phase: "setup", dayFrom: 1, dayTo: 2, nextActionId: "compact.start", actionIntervalDays: 1 },
        { id: "finish", phase: "harvest", dayFrom: 3, dayTo: null, nextActionId: "compact.finish", actionIntervalDays: 2, harvestReady: true }
      ]
    };
    expect(() => validateSeedCycleDefinition(compactDefinition)).not.toThrow();
    const [startStage, finishStage] = compactDefinition.stages;
    if (!startStage || !finishStage) throw new Error("The compact test definition requires two stages.");
    expect(() => validateSeedCycleDefinition({ ...compactDefinition, stages: [{ ...startStage, dayFrom: 2 }, finishStage] })).toThrowError(expect.objectContaining({ code: "INVALID_STAGE_DEFINITION" }));
  });

  it("rejects invalid dates, timezones, future starts and content-version drift", () => {
    expect(() => calculateCycleDay("not-a-date", "2026-08-01T09:00:00.000Z", "Europe/London")).toThrowError(expect.objectContaining({ code: "INVALID_DATE" }));
    expect(() => calculateCycleDay("2026-08-01T09:00:00.000Z", "2026-08-01T10:00:00.000Z", "Mars/Olympus_Mons")).toThrowError(expect.objectContaining({ code: "INVALID_TIMEZONE" }));
    expect(() => calculateCycleDay("2026-08-02T09:00:00.000Z", "2026-08-01T09:00:00.000Z", "Europe/London")).toThrowError(expect.objectContaining({ code: "CURRENT_TIME_BEFORE_START" }));
    expect(() => evaluateCycle({ cycle: cressCycle({ seedContentVersion: 2 }), definition: cressDefinition, clock: new TestClock("2026-08-02T09:00:00.000Z") })).toThrowError(expect.objectContaining({ code: "INVALID_STAGE_DEFINITION" }));
  });
});
