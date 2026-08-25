import type { CycleRepository, SaveCycleEventInput, StartCycleInput } from "@/src/ports/CycleRepository";
import type { CycleState } from "@/src/domain";
import { supabase } from "@/src/infrastructure/supabase/client";
import type { CycleRow } from "@/src/infrastructure/supabase/database.types";

export class SupabaseCycleRepository implements CycleRepository {
  async getActive(): Promise<readonly CycleState[]> {
    const { data, error } = await supabase.from("cycles").select("*").in("status", ["active", "harvest_ready"]).order("started_at", { ascending: false });
    if (error) throw error;
    return data.map(mapCycle);
  }

  async get(id: string): Promise<CycleState | null> {
    const { data, error } = await supabase.from("cycles").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? mapCycle(data) : null;
  }

  async start(input: StartCycleInput): Promise<CycleState> {
    const { data, error } = await supabase.rpc("start_cycle", {
      p_seed_id: input.seedId,
      p_seed_content_version: input.seedContentVersion,
      p_started_at: input.startedAt,
      p_timezone: input.timezone,
      p_client_event_id: input.clientEventId
    });
    if (error) throw error;
    return mapCycle(data);
  }

  async saveEvent(input: SaveCycleEventInput): Promise<void> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!userData.user) throw new Error("An authenticated user is required to save a cycle event.");
    const { error } = await supabase.from("cycle_events").insert({
      cycle_id: input.cycleId,
      user_id: userData.user.id,
      event_type: input.eventType,
      payload: input.payload,
      occurred_at: input.occurredAt,
      client_event_id: input.clientEventId,
      schema_version: input.schemaVersion ?? 1
    });
    if (error) throw error;
  }
}

function mapCycle(row: CycleRow): CycleState {
  return {
    id: row.id,
    seedId: row.seed_id,
    seedContentVersion: row.seed_content_version,
    status: row.status,
    startedAt: row.started_at,
    timezone: row.timezone,
    currentStageId: row.current_stage,
    lastActionAt: row.last_action_at,
    harvestedAt: row.harvested_at,
    lastHarvestedAt: row.last_harvested_at,
    harvestCount: row.harvest_count
  };
}

export const cycleRepository = new SupabaseCycleRepository();
