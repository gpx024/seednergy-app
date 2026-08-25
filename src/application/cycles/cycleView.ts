import { calculateCycleDay, evaluateCycle, SystemClock, type Clock, type CycleState, type SeedCycleDefinition } from "@/src/domain";
import type { PublishedSeed } from "@/src/domain/content";

export type CyclePriority = "harvest_ready" | "needs_check" | "action_due" | "harvest_soon" | "normal";

export interface CycleView {
  readonly cycle: CycleState;
  readonly seed: PublishedSeed;
  readonly day: number;
  readonly totalDays: number;
  readonly progress: number;
  readonly phase: "setup" | "growth" | "harvest";
  readonly stageId: string;
  readonly stageLabel: string;
  readonly status: CycleState["status"];
  readonly priority: CyclePriority;
  readonly actionCompletedToday: boolean;
  readonly actionDue: boolean;
  readonly nextAction: string;
  readonly guidance: string;
  readonly observationPrompt: string;
}

export function toCycleDefinition(seed: PublishedSeed): SeedCycleDefinition {
  return {
    seedId: seed.id,
    contentVersion: seed.contentVersion,
    harvestMode: seed.harvestMode,
    stages: seed.stages.map((stage) => ({
      id: stage.stage,
      phase: stage.phase,
      dayFrom: stage.startDay,
      dayTo: stage.endDay,
      nextActionId: stage.nextAction,
      actionIntervalDays: stage.actionIntervalDays,
      harvestReady: stage.harvestReady
    }))
  };
}

export function buildCycleView(cycle: CycleState, seed: PublishedSeed, clock?: Clock): CycleView {
  const effectiveClock = clock ?? new SystemClock();
  const evaluation = evaluateCycle({ cycle, definition: toCycleDefinition(seed), clock: effectiveClock });
  const authoredStage = seed.stages.find((stage) => stage.stage === evaluation.stage.id);
  if (!authoredStage) throw new Error(`Cycle stage ${evaluation.stage.id} is missing authored content.`);
  const totalDays = seed.durationDaysMax;
  const harvestSoon = evaluation.phase === "growth" && evaluation.cycleDay >= Math.max(1, seed.durationDaysMin - 2);
  const daysSinceAction = cycle.lastActionAt ? calculateCycleDay(cycle.lastActionAt, effectiveClock.now(), cycle.timezone) - 1 : 0;
  const actionCompletedToday = cycle.lastActionAt !== null && daysSinceAction === 0;
  const overdue = cycle.lastActionAt !== null && daysSinceAction > evaluation.stage.actionIntervalDays;
  const priority: CyclePriority = evaluation.harvestReady
    ? "harvest_ready"
    : overdue
      ? "needs_check"
      : evaluation.actionState === "due"
        ? "action_due"
        : harvestSoon
          ? "harvest_soon"
          : "normal";

  return {
    cycle,
    seed,
    day: evaluation.cycleDay,
    totalDays,
    progress: Math.min(1, evaluation.cycleDay / totalDays),
    phase: evaluation.phase,
    stageId: evaluation.stage.id,
    stageLabel: authoredStage.stage,
    status: evaluation.status,
    priority,
    actionCompletedToday,
    actionDue: evaluation.actionState === "due",
    nextAction: authoredStage.nextAction,
    guidance: authoredStage.guidance,
    observationPrompt: authoredStage.observationPrompt
  };
}

const priorityOrder: Record<CyclePriority, number> = {
  harvest_ready: 0,
  needs_check: 1,
  action_due: 2,
  harvest_soon: 3,
  normal: 4
};

export function prioritizeCycleViews(cycles: readonly CycleView[]): readonly CycleView[] {
  return [...cycles].sort((left, right) => priorityOrder[left.priority] - priorityOrder[right.priority] || right.day - left.day);
}
