import { CycleDomainError } from "./errors";

export type UserFacingPhase = "setup" | "growth" | "harvest";

export interface CycleStageDefinition {
  readonly id: string;
  readonly phase: UserFacingPhase;
  readonly dayFrom: number;
  readonly dayTo: number | null;
  readonly nextActionId: string;
  readonly actionIntervalDays: number;
  readonly harvestReady?: boolean;
}

export interface SeedCycleDefinition {
  readonly seedId: string;
  readonly contentVersion: number;
  readonly harvestMode: "single" | "repeating";
  readonly stages: readonly CycleStageDefinition[];
}

const phaseOrder: Record<UserFacingPhase, number> = { setup: 0, growth: 1, harvest: 2 };

export function validateSeedCycleDefinition(definition: SeedCycleDefinition): void {
  if (!definition.seedId || !Number.isInteger(definition.contentVersion) || definition.contentVersion < 1 || definition.stages.length === 0) {
    invalid("A seed cycle definition requires an id, a positive content version and at least one stage.");
  }

  const ids = new Set<string>();
  let expectedDayFrom = 1;
  let previousPhase = -1;

  definition.stages.forEach((stage, index) => {
    if (!stage.id || ids.has(stage.id)) invalid("Every cycle stage requires a unique id.");
    ids.add(stage.id);

    if (!Number.isInteger(stage.dayFrom) || stage.dayFrom !== expectedDayFrom) invalid("Cycle stages must begin on day 1 and contain no gaps or overlaps.");
    if (stage.dayTo !== null && (!Number.isInteger(stage.dayTo) || stage.dayTo < stage.dayFrom)) invalid("A stage end day cannot precede its start day.");
    if (stage.dayTo === null && index !== definition.stages.length - 1) invalid("Only the final cycle stage may be open-ended.");
    if (!Number.isInteger(stage.actionIntervalDays) || stage.actionIntervalDays < 1) invalid("Action intervals must be positive whole days.");
    if (!stage.nextActionId) invalid("Every stage requires a next-action content id.");
    if (phaseOrder[stage.phase] < previousPhase) invalid("User-facing phases cannot move backwards.");
    if (stage.harvestReady && stage.phase !== "harvest") invalid("Only a harvest phase can be harvest-ready.");

    previousPhase = phaseOrder[stage.phase];
    if (stage.dayTo !== null) expectedDayFrom = stage.dayTo + 1;
  });

  if (!definition.stages.some((stage) => stage.phase === "harvest" && stage.harvestReady)) {
    invalid("A cycle definition requires at least one harvest-ready stage.");
  }
}

export function resolveStage(stages: readonly CycleStageDefinition[], cycleDay: number): CycleStageDefinition {
  if (!Number.isInteger(cycleDay) || cycleDay < 1 || stages.length === 0) invalid("A positive cycle day and at least one stage are required.");
  const matchingStage = stages.find((stage) => cycleDay >= stage.dayFrom && (stage.dayTo === null || cycleDay <= stage.dayTo));
  const finalStage = stages.at(-1);
  if (!finalStage) invalid("At least one stage is required.");
  return matchingStage ?? finalStage;
}

function invalid(message: string): never {
  throw new CycleDomainError("INVALID_STAGE_DEFINITION", message);
}
