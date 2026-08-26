import type { HarvestRecord } from "@/src/domain";

export interface CompleteHarvestInput {
  cycleId: string;
  harvestedAt: string;
  storagePath: string | null;
  clientEventId: string;
}

export interface HarvestRepository {
  complete(input: CompleteHarvestInput): Promise<HarvestRecord>;
  requestSuggestions(harvestId: string): Promise<HarvestRecord>;
  get(id: string): Promise<HarvestRecord | null>;
  getAll(): Promise<readonly HarvestRecord[]>;
}
