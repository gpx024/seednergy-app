import type { CycleState } from "@/src/domain";

export type PersistenceJson = string | number | boolean | null | { [key: string]: PersistenceJson | undefined } | PersistenceJson[];

export interface StartCycleInput {
  seedId: string;
  seedContentVersion: number;
  startedAt: string;
  timezone: string;
  clientEventId: string;
}

export interface SaveCycleEventInput {
  cycleId: string;
  eventType: string;
  payload: PersistenceJson;
  occurredAt: string;
  clientEventId: string;
  schemaVersion?: number;
}

export interface CycleRepository {
  getActive(): Promise<readonly CycleState[]>;
  get(id: string): Promise<CycleState | null>;
  start(input: StartCycleInput): Promise<CycleState>;
  saveEvent(input: SaveCycleEventInput): Promise<void>;
}
