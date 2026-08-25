import type { ContentRepository, PublishedSeed, SeedSummary } from "@/src/ports/ContentRepository";
import { supabase } from "@/src/infrastructure/supabase/client";
import type { SeedRow, SeedStageRow } from "@/src/infrastructure/supabase/database.types";

const seedColumns = "id,slug,name,description,expected_result,duration_days,access_type,images,active,content_version,harvest_mode";

export class SupabaseContentRepository implements ContentRepository {
  async getLibrary(): Promise<readonly SeedSummary[]> {
    const { data, error } = await supabase.from("seeds").select(seedColumns).eq("active", true).order("name");
    if (error) throw error;
    return (data as unknown as SeedRow[]).map(mapSeed);
  }

  async getPublishedSeed(slug: string): Promise<PublishedSeed | null> {
    const seedResult = await supabase.from("seeds").select(seedColumns).eq("slug", slug).eq("active", true).maybeSingle();
    if (seedResult.error) throw seedResult.error;
    if (!seedResult.data) return null;
    const seed = seedResult.data as unknown as SeedRow;
    const stageResult = await supabase.from("seed_stages").select("*").eq("seed_id", seed.id).order("position");
    if (stageResult.error) throw stageResult.error;
    return {
      ...mapSeed(seed),
      harvestMode: seed.harvest_mode,
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
        harvestCriteria: stage.harvest_criteria
      }))
    };
  }
}

function mapSeed(seed: SeedRow): SeedSummary {
  return {
    id: seed.id,
    slug: seed.slug,
    commonName: seed.name,
    description: seed.description,
    contentVersion: seed.content_version,
    estimatedHarvestDays: seed.duration_days,
    images: seed.images,
    isPremium: seed.access_type === "paid"
  };
}

export const contentRepository = new SupabaseContentRepository();
