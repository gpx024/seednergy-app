import type { CycleState } from "./cycle";
import { CycleDomainError } from "./errors";
import type { SeedCycleDefinition } from "./stages";

export type CycleCommand = "archive" | "mark_harvest_ready" | "mark_harvested";

export function applyCycleCommand(cycle: CycleState, definition: SeedCycleDefinition, command: CycleCommand, occurredAt: string, harvestReady: boolean): CycleState {
  assertTimestamp(occurredAt);

  if (command === "archive") {
    if (cycle.status === "archived") invalid(cycle.status, command);
    return { ...cycle, status: "archived" };
  }

  if (command === "mark_harvest_ready") {
    if (cycle.status !== "active") invalid(cycle.status, command);
    if (!harvestReady) throw new CycleDomainError("NOT_HARVEST_READY", "This cycle has not reached its harvest-ready stage.");
    return { ...cycle, status: "harvest_ready" };
  }

  if (cycle.status !== "harvest_ready") invalid(cycle.status, command);
  if (definition.harvestMode === "repeating") {
    return { ...cycle, status: "active", harvestCount: cycle.harvestCount + 1, lastHarvestedAt: occurredAt };
  }
  return { ...cycle, status: "harvested", harvestCount: cycle.harvestCount + 1, harvestedAt: occurredAt, lastHarvestedAt: occurredAt };
}

function assertTimestamp(value: string): void {
  if (Number.isNaN(new Date(value).getTime())) throw new CycleDomainError("INVALID_DATE", "Cycle commands require a valid timestamp.");
}

function invalid(status: CycleState["status"], command: CycleCommand): never {
  throw new CycleDomainError("INVALID_STATUS_TRANSITION", `Cannot apply ${command} while a cycle is ${status}.`);
}
