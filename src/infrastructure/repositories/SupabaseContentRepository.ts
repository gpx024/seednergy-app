import { z } from "zod";

import { publishedSeedSchema, seedSummarySchema, type PublishedSeed, type SeedSummary } from "@/src/domain/content";
import type { ContentRepository } from "@/src/ports/ContentRepository";
import { supabase } from "@/src/infrastructure/supabase/client";
import type { SeedRow, SeedStageRow } from "@/src/infrastructure/supabase/database.types";

const seedColumns = "id,slug,name,botanical_name,description,expected_result,duration_days,duration_days_min,duration_days_max,difficulty_label,environment_summary,light_summary,access_type,images,materials,harvest_instructions,harvest_readiness,storage_guidance,taste_profile,content_review_status,active,content_version,harvest_mode";

export class ContentValidationError extends Error {
  readonly code = "INVALID_SEED_CONTENT";
  constructor(readonly details: readonly z.core.$ZodIssue[]) {
    super("This seed content is incomplete or invalid. Please try again after it has been corrected.");
    this.name = "ContentValidationError";
  }
}

export class SupabaseContentRepository implements ContentRepository {
  async getLibrary(): Promise<readonly SeedSummary[]> {
    const { data, error } = await supabase.from("seeds").select(seedColumns).eq("active", true).order("name");
    if (error) throw error;
    return (data as unknown as SeedRow[]).map(mapSeed);
  }

  async getPublishedSeed(slug: string): Promise<PublishedSeed | null> {
    return this.getPublishedSeedWhere("slug", slug);
  }

  async getPublishedSeedById(id: string): Promise<PublishedSeed | null> {
    return this.getPublishedSeedWhere("id", id);
  }

  private async getPublishedSeedWhere(column: "id" | "slug", value: string): Promise<PublishedSeed | null> {
    const seedResult = await supabase.from("seeds").select(seedColumns).eq(column, value).eq("active", true).maybeSingle();
    if (seedResult.error) throw seedResult.error;
    if (!seedResult.data) return null;
    const seed = seedResult.data as unknown as SeedRow;
    const stageResult = await supabase.from("seed_stages").select("*").eq("seed_id", seed.id).order("position");
    if (stageResult.error) throw stageResult.error;
    return parseOrThrow(publishedSeedSchema, {
      ...mapSeed(seed),
      harvestMode: seed.harvest_mode,
      materials: seed.materials,
      harvestInstructions: seed.harvest_instructions,
      harvestReadiness: seed.harvest_readiness,
      storageGuidance: seed.storage_guidance,
      tasteProfile: seed.taste_profile,
      stages: (stageResult.data as SeedStageRow[]).map((stage) => ({
        id: stage.id,
        stage: stage.stage,
        phase: stage.phase,
        position: stage.position,
        startDay: stage.day_from,
        endDay: stage.day_to,
        nextAction: stage.next_action,
        actionIntervalDays: stage.action_interval_days,
        guidance: stage.guidance,
        observationPrompt: stage.observation_prompt,
        whatIsHappening: stage.what_is_happening,
        milestone: stage.milestone,
        whatGoodLooksLike: stage.what_good_looks_like,
        commonProblems: stage.common_problems,
        photoCheckPrompt: stage.photo_check_prompt,
        harvestReady: stage.harvest_ready,
        harvestCriteria: stage.harvest_criteria
      }))
    });
  }
}

function mapSeed(seed: SeedRow): SeedSummary {
  return parseOrThrow(seedSummarySchema, {
    id: seed.id,
    slug: seed.slug,
    commonName: seed.name,
    botanicalName: seed.botanical_name,
    description: seed.description,
    expectedResult: seed.expected_result,
    contentVersion: seed.content_version,
    durationDaysMin: seed.duration_days_min,
    durationDaysMax: seed.duration_days_max,
    difficulty: seed.difficulty_label,
    environmentSummary: seed.environment_summary,
    lightSummary: seed.light_summary,
    accessType: seed.access_type,
    images: seed.images,
    reviewStatus: seed.content_review_status
  });
}

function parseOrThrow<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) throw new ContentValidationError(result.error.issues);
  return result.data;
}

export const contentRepository = new SupabaseContentRepository();
