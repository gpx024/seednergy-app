import { harvestRecordSchema, harvestSuggestionsSchema, type HarvestRecord } from "@/src/domain";
import type { CompleteHarvestInput, HarvestRepository } from "@/src/ports/HarvestRepository";
import { supabase } from "@/src/infrastructure/supabase/client";
import type { HarvestRow, Json } from "@/src/infrastructure/supabase/database.types";

export class SupabaseHarvestRepository implements HarvestRepository {
  async complete(input: CompleteHarvestInput): Promise<HarvestRecord> {
    const { data, error } = await supabase.rpc("complete_cycle_harvest", {
      p_cycle_id: input.cycleId,
      p_harvested_at: input.harvestedAt,
      p_storage_path: input.storagePath,
      p_client_event_id: input.clientEventId
    });
    if (error) throw error;
    return mapHarvest(data);
  }

  async requestSuggestions(harvestId: string): Promise<HarvestRecord> {
    const { data, error } = await supabase.functions.invoke("harvest-suggestions", { body: { harvestId } });
    if (error) throw error;
    return mapHarvest(data.harvest as HarvestRow);
  }

  async get(id: string): Promise<HarvestRecord | null> {
    const { data, error } = await supabase.from("harvests").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? mapHarvest(data) : null;
  }

  async getAll(): Promise<readonly HarvestRecord[]> {
    const { data, error } = await supabase.from("harvests").select("*").order("harvested_at", { ascending: false });
    if (error) throw error;
    return data.map(mapHarvest);
  }
}

function mapHarvest(row: HarvestRow): HarvestRecord {
  const parsedSuggestions = harvestSuggestionsSchema.safeParse(row.suggestions);
  return harvestRecordSchema.parse({
    id: row.id,
    cycleId: row.cycle_id,
    userId: row.user_id,
    seedId: row.seed_id,
    harvestNumber: row.harvest_number,
    harvestedAt: row.harvested_at,
    storagePath: row.storage_path,
    suggestions: parsedSuggestions.success ? parsedSuggestions.data : null,
    suggestionStatus: row.suggestion_status,
    promptVersion: row.prompt_version,
    modelVersion: row.model_version,
    costEstimate: Number(row.cost_estimate_usd),
    latencyMs: row.latency_ms
  });
}

export function suggestionsToJson(value: HarvestRecord["suggestions"]): Json { return value as Json; }
export const harvestRepository = new SupabaseHarvestRepository();
