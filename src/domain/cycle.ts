import type { Clock } from "./clock";
import { SystemClock } from "./clock";
import { CycleDomainError } from "./errors";
import { resolveStage, type CycleStageDefinition, type SeedCycleDefinition, type UserFacingPhase, validateSeedCycleDefinition } from "./stages";

export type CycleStatus = "active" | "harvest_ready" | "harvested" | "archived";
export type ActionState = "due" | "none" | "upcoming";

export interface CycleState {
  readonly id: string;
  readonly seedId: string;
  readonly seedContentVersion: number;
  readonly status: CycleStatus;
  readonly startedAt: string;
  readonly timezone: string;
  readonly currentStageId: string | null;
  readonly lastActionAt: string | null;
  readonly harvestCount: number;
  readonly harvestedAt: string | null;
  readonly lastHarvestedAt: string | null;
}

export interface CycleEvaluation {
  readonly cycleDay: number;
  readonly stage: CycleStageDefinition;
  readonly phase: UserFacingPhase;
  readonly status: CycleStatus;
  readonly nextActionId: string | null;
  readonly actionState: ActionState;
  readonly needsCheck: boolean;
  readonly harvestReady: boolean;
  readonly stageTransitioned: boolean;
}

export interface EvaluateCycleInput {
  readonly cycle: CycleState;
  readonly definition: SeedCycleDefinition;
  readonly clock?: Clock;
}

export function createCycle(input: Pick<CycleState, "id" | "seedId" | "seedContentVersion" | "startedAt" | "timezone">): CycleState {
  assertDate(input.startedAt);
  assertTimezone(input.timezone);
  return { ...input, status: "active", currentStageId: null, lastActionAt: null, harvestCount: 0, harvestedAt: null, lastHarvestedAt: null };
}

export function evaluateCycle({ cycle, definition, clock = new SystemClock() }: EvaluateCycleInput): CycleEvaluation {
  validateCompatibility(cycle, definition);
  const cycleDay = calculateCycleDay(cycle.startedAt, clock.now(), cycle.timezone);
  const stage = resolveStage(definition.stages, cycleDay);
  const terminal = cycle.status === "harvested" || cycle.status === "archived";
  const repeatingHarvestDue = definition.harvestMode !== "repeating" || cycle.lastHarvestedAt === null || isActionDue(cycle.lastHarvestedAt, clock.now(), cycle.timezone, stage.actionIntervalDays);
  const harvestReady = !terminal && Boolean(stage.harvestReady) && repeatingHarvestDue;
  const status = cycle.status === "active" && harvestReady ? "harvest_ready" : cycle.status;
  const needsCheck = !terminal && isActionDue(cycle.lastActionAt, clock.now(), cycle.timezone, stage.actionIntervalDays);

  return {
    cycleDay,
    stage,
    phase: stage.phase,
    status,
    nextActionId: terminal ? null : stage.nextActionId,
    actionState: terminal ? "none" : needsCheck ? "due" : "upcoming",
    needsCheck,
    harvestReady,
    stageTransitioned: cycle.currentStageId !== stage.id
  };
}

export function calculateCycleDay(startedAt: string | Date, currentTime: string | Date, timezone: string): number {
  const start = toDate(startedAt);
  const current = toDate(currentTime);
  assertTimezone(timezone);
  const difference = localDateOrdinal(current, timezone) - localDateOrdinal(start, timezone);
  if (difference < 0) throw new CycleDomainError("CURRENT_TIME_BEFORE_START", "The current time cannot precede the cycle start date.");
  return difference + 1;
}

function isActionDue(lastActionAt: string | null, currentTime: Date, timezone: string, intervalDays: number): boolean {
  if (lastActionAt === null) return true;
  return calculateCycleDay(lastActionAt, currentTime, timezone) - 1 >= intervalDays;
}

function validateCompatibility(cycle: CycleState, definition: SeedCycleDefinition): void {
  validateSeedCycleDefinition(definition);
  if (cycle.seedId !== definition.seedId || cycle.seedContentVersion !== definition.contentVersion) {
    throw new CycleDomainError("INVALID_STAGE_DEFINITION", "The cycle must use the seed definition and immutable content version it started with.");
  }
  assertDate(cycle.startedAt);
  if (cycle.lastActionAt !== null) assertDate(cycle.lastActionAt);
  if (cycle.harvestedAt !== null) assertDate(cycle.harvestedAt);
  if (cycle.lastHarvestedAt !== null) assertDate(cycle.lastHarvestedAt);
  assertTimezone(cycle.timezone);
}

function localDateOrdinal(date: Date, timezone: string): number {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return Math.floor(Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day)) / 86_400_000);
}

function assertTimezone(timezone: string): void {
  try {
    new Intl.DateTimeFormat("en", { timeZone: timezone }).format();
  } catch {
    throw new CycleDomainError("INVALID_TIMEZONE", `Unknown timezone: ${timezone}`);
  }
}

function assertDate(value: string | Date): void {
  toDate(value);
}

function toDate(value: string | Date): Date {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  if (Number.isNaN(date.getTime())) throw new CycleDomainError("INVALID_DATE", "The cycle requires a valid date.");
  return date;
}
