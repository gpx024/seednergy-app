export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface ProfileRow {
  id: string;
  email: string;
  display_name: string | null;
  city: string | null;
  locale: string | null;
  timezone: string | null;
  environment: string | null;
  light_condition: string | null;
  time_availability: string | null;
  motivation: string | null;
  notification_prefs: Json;
  quiet_hours: Json | null;
  created_at: string;
  deleted_at: string | null;
}

export interface CycleRow {
  id: string;
  user_id: string;
  seed_id: string;
  seed_content_version: number;
  status: "active" | "harvest_ready" | "harvested" | "archived";
  started_at: string;
  timezone: string;
  current_stage: string | null;
  last_action_at: string | null;
  harvested_at: string | null;
  last_harvested_at: string | null;
  harvest_count: number;
  created_at: string;
}

export interface CycleEventRow {
  id: string;
  cycle_id: string;
  user_id: string;
  event_type: string;
  payload: Json;
  occurred_at: string;
  client_event_id: string;
  schema_version: number;
}

export interface SeedStageRow {
  id: string;
  seed_id: string;
  stage: string;
  phase: "setup" | "growth" | "harvest";
  position: number;
  day_from: number;
  day_to: number | null;
  next_action: string;
  action_interval_days: number;
  guidance: string;
  observation_prompt: string;
  what_is_happening: string;
  milestone: string;
  what_good_looks_like: string;
  common_problems: Json;
  photo_check_prompt: string | null;
  harvest_ready: boolean;
  image: string | null;
  harvest_criteria: Json | null;
}

export interface SeedRow {
  id: string;
  slug: string;
  name: string;
  botanical_name: string;
  description: string;
  expected_result: string;
  content_version: number;
  active: boolean;
  harvest_mode: "single" | "repeating";
  duration_days: number;
  duration_days_min: number;
  duration_days_max: number;
  difficulty_label: string;
  environment_summary: string;
  light_summary: string;
  access_type: "free" | "paid" | "coming_soon";
  images: Json;
  materials: Json;
  harvest_instructions: string;
  harvest_readiness: string;
  storage_guidance: string;
  taste_profile: string;
  content_review_status: "draft" | "grower_reviewed";
  content_sources: Json;
}

type TableShape<Row, Insert = Partial<Row>, Update = Partial<Insert>> = { Row: Row; Insert: Insert; Update: Update; Relationships: [] };

export interface Database {
  public: {
    Tables: {
      profiles: TableShape<ProfileRow>;
      cycles: TableShape<CycleRow>;
      cycle_events: TableShape<CycleEventRow, Omit<CycleEventRow, "id"> & { id?: string }>;
      seeds: TableShape<SeedRow>;
      seed_stages: TableShape<SeedStageRow>;
    };
    Views: Record<never, never>;
    Functions: {
      start_cycle: {
        Args: { p_seed_id: string; p_seed_content_version: number; p_started_at: string; p_timezone: string; p_client_event_id: string };
        Returns: CycleRow;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}
