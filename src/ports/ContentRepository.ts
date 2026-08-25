import type { PersistenceJson } from "@/src/ports/CycleRepository";

export interface SeedSummary {
  id: string;
  slug: string;
  commonName: string;
  description: string;
  contentVersion: number;
  estimatedHarvestDays: number;
  images: PersistenceJson;
  isPremium: boolean;
}

export interface PublishedSeed extends SeedSummary {
  harvestMode: "single" | "repeating";
  stages: readonly { id: string; stage: string; phase: "setup" | "growth" | "harvest"; position: number; startDay: number; endDay: number | null; nextAction: string; actionIntervalDays: number; guidance: string; observationPrompt: string; harvestCriteria: PersistenceJson | null }[];
}

export interface ContentRepository {
  getPublishedSeed(slug: string): Promise<PublishedSeed | null>;
  getLibrary(): Promise<readonly SeedSummary[]>;
}
