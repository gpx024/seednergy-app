import type { PublishedSeed, SeedSummary } from "@/src/domain/content";

export type { PublishedSeed, SeedSummary } from "@/src/domain/content";

export interface ContentRepository {
  getPublishedSeed(slug: string): Promise<PublishedSeed | null>;
  getPublishedSeedById(id: string): Promise<PublishedSeed | null>;
  getLibrary(): Promise<readonly SeedSummary[]>;
}
