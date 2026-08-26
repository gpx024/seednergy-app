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
  environment_slug: string | null;
  light_condition_slug: string | null;
  onboarding_completed_at: string | null;
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

export interface PhotoCheckRow {
  id: string;
  cycle_id: string;
  user_id: string;
  check_type: string | null;
  storage_path: string;
  submitted_at: string;
  status: string;
  confidence: string | null;
  result: Json | null;
  quota_consumed: boolean;
  retention_expires_at: string | null;
  error_code: string | null;
  client_event_id: string | null;
}

export interface AiRequestLogRow {
  id: string;
  user_id: string;
  cycle_id: string;
  client_event_id: string;
  state: "running" | "completed" | "failed";
  status: string | null;
  confidence: string | null;
  model_version: string;
  prompt_version: string;
  input_tokens: number;
  cached_input_tokens: number;
  output_tokens: number;
  cost_estimate_usd: number;
  latency_ms: number;
  attempt_count: number;
  provider_request_id: string | null;
  quota_consumed: boolean;
  error_code: string | null;
  created_at: string;
  finished_at: string | null;
  lease_token: string | null;
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
      photo_checks: TableShape<PhotoCheckRow>;
      ai_request_logs: TableShape<AiRequestLogRow>;
      seeds: TableShape<SeedRow>;
      seed_stages: TableShape<SeedStageRow>;
    };
    Views: Record<never, never>;
    Functions: {
      start_cycle: {
        Args: { p_seed_id: string; p_seed_content_version: number; p_started_at: string; p_timezone: string; p_client_event_id: string };
        Returns: CycleRow;
      };
      mark_cycle_action_done: {
        Args: { p_cycle_id: string; p_stage_id: string; p_occurred_at: string; p_client_event_id: string };
        Returns: CycleRow;
      };
      archive_cycle: {
        Args: { p_cycle_id: string; p_occurred_at: string; p_client_event_id: string };
        Returns: CycleRow;
      };
      restart_cycle: {
        Args: { p_cycle_id: string; p_started_at: string; p_timezone: string; p_client_event_id: string };
        Returns: CycleRow;
      };
      complete_onboarding: {
        Args: { p_display_name: string | null; p_environment_slug: string; p_light_slug: string; p_time_availability: string; p_motivation: string; p_timezone: string; p_notifications_enabled: boolean };
        Returns: ProfileRow;
      };
      save_photo_check: {
        Args: { p_cycle_id: string; p_check_type: string; p_storage_path: string; p_result: Json; p_occurred_at: string; p_client_event_id: string };
        Returns: PhotoCheckRow;
      };
      begin_ai_photo_check: {
        Args: { p_user_id: string; p_cycle_id: string; p_client_event_id: string; p_daily_limit: number; p_model_version: string; p_prompt_version: string; p_lease_token: string };
        Returns: AiRequestLogRow;
      };
      finish_ai_photo_check: {
        Args: { p_request_id: string; p_status: string; p_confidence: string; p_input_tokens: number; p_cached_input_tokens: number; p_output_tokens: number; p_cost_estimate_usd: number; p_latency_ms: number; p_attempt_count: number; p_provider_request_id: string | null; p_error_code: string | null };
        Returns: AiRequestLogRow;
      };
      complete_ai_photo_check: {
        Args: { p_request_id: string; p_lease_token: string; p_user_id: string; p_check_type: string; p_storage_path: string; p_result: Json; p_occurred_at: string; p_input_tokens: number; p_cached_input_tokens: number; p_output_tokens: number; p_cost_estimate_usd: number; p_latency_ms: number; p_attempt_count: number; p_provider_request_id: string | null; p_error_code: string | null };
        Returns: PhotoCheckRow;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}
