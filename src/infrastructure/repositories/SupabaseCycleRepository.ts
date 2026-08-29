import type { CycleRepository, SaveCycleEventInput, StartCycleInput } from "@/src/ports/CycleRepository";
import type { CycleState } from "@/src/domain";
import { supabase } from "@/src/infrastructure/supabase/client";
import type { CycleRow } from "@/src/infrastructure/supabase/database.types";
import { z } from "zod";

import { isBackendUnavailable } from "@/src/ports/BackendAvailability";
import { createPrivateCacheKey, readCached, writeCached } from "@/src/infrastructure/cache/resourceCache";

const cycleStateSchema = z.object({
  id: z.string().uuid(), seedId: z.string().uuid(), seedContentVersion: z.number().int().positive(),
  status: z.enum(["active", "harvest_ready", "harvested", "archived"]), startedAt: z.string(), timezone: z.string(),
  currentStageId: z.string().nullable(), lastActionAt: z.string().nullable(), harvestCount: z.number().int().nonnegative(),
  harvestedAt: z.string().nullable(), lastHarvestedAt: z.string().nullable()
});

export class SupabaseCycleRepository implements CycleRepository {
  async getAll(): Promise<readonly CycleState[]> {
    return this.getList("all", async () => supabase.from("cycles").select("*").order("started_at", { ascending: false }));
  }

  async getActive(): Promise<readonly CycleState[]> {
    return this.getList("active", async () => supabase.from("cycles").select("*").in("status", ["active", "harvest_ready"]).order("started_at", { ascending: false }));
  }

  async get(id: string): Promise<CycleState | null> {
    const userId = await this.getUserId();
    const key = createPrivateCacheKey(userId, `cycle-${id}`);
    try {
      const { data, error } = await supabase.from("cycles").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      const cycle = data ? mapCycle(data) : null;
      if (cycle) await writeCached(key, cycle);
      return cycle;
    } catch (reason) {
      const cached = isBackendUnavailable(reason) ? await readCached(key, cycleStateSchema) : null;
      if (cached) return cached;
      throw reason;
    }
  }

  private async getList(cacheName: string, loader: () => PromiseLike<{ data: CycleRow[] | null; error: unknown }>): Promise<readonly CycleState[]> {
    const userId = await this.getUserId();
    const key = createPrivateCacheKey(userId, `cycles-${cacheName}`);
    try {
      const { data, error } = await loader();
      if (error) throw error;
      const cycles = (data ?? []).map(mapCycle);
      await writeCached(key, cycles);
      await Promise.all(cycles.map((cycle) => writeCached(createPrivateCacheKey(userId, `cycle-${cycle.id}`), cycle)));
      return cycles;
    } catch (reason) {
      const cached = isBackendUnavailable(reason) ? await readCached(key, z.array(cycleStateSchema)) : null;
      if (cached) return cached;
      throw reason;
    }
  }

  private async getUserId(): Promise<string> {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (!data.session?.user.id) throw new Error("An authenticated user is required to load cycles.");
    return data.session.user.id;
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

  async markActionDone(input: { cycleId: string; stageId: string; occurredAt: string; clientEventId: string }): Promise<CycleState> {
    const { data, error } = await supabase.rpc("mark_cycle_action_done", {
      p_cycle_id: input.cycleId,
      p_stage_id: input.stageId,
      p_occurred_at: input.occurredAt,
      p_client_event_id: input.clientEventId
    });
    if (error) throw error;
    return mapCycle(data);
  }

  async archive(input: { cycleId: string; occurredAt: string; clientEventId: string }): Promise<CycleState> {
    const { data, error } = await supabase.rpc("archive_cycle", {
      p_cycle_id: input.cycleId,
      p_occurred_at: input.occurredAt,
      p_client_event_id: input.clientEventId
    });
    if (error) throw error;
    return mapCycle(data);
  }

  async restart(input: { cycleId: string; startedAt: string; timezone: string; clientEventId: string }): Promise<CycleState> {
    const { data, error } = await supabase.rpc("restart_cycle", {
      p_cycle_id: input.cycleId,
      p_started_at: input.startedAt,
      p_timezone: input.timezone,
      p_client_event_id: input.clientEventId
    });
    if (error) throw error;
    return mapCycle(data);
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
