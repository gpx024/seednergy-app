import type { CompleteOnboardingInput, GrowerProfile, ProfileRepository } from "@/src/ports/ProfileRepository";
import { supabase } from "@/src/infrastructure/supabase/client";
import type { ProfileRow } from "@/src/infrastructure/supabase/database.types";

export class SupabaseProfileRepository implements ProfileRepository {
  async getMine(): Promise<GrowerProfile | null> {
    const { data, error } = await supabase.from("profiles").select("*").maybeSingle();
    if (error) throw error;
    return data ? mapProfile(data) : null;
  }

  async completeOnboarding(input: CompleteOnboardingInput): Promise<GrowerProfile> {
    const { data, error } = await supabase.rpc("complete_onboarding", {
      p_display_name: input.displayName,
      p_environment_slug: input.environment,
      p_light_slug: input.lightCondition,
      p_time_availability: input.timeAvailability,
      p_motivation: input.motivation,
      p_timezone: input.timezone,
      p_notifications_enabled: input.notificationsEnabled
    });
    if (error) throw error;
    return mapProfile(data);
  }
}

function mapProfile(row: ProfileRow): GrowerProfile {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    environment: row.environment_slug,
    lightCondition: row.light_condition_slug,
    timeAvailability: row.time_availability,
    motivation: row.motivation,
    onboardingCompletedAt: row.onboarding_completed_at
  };
}

export const profileRepository = new SupabaseProfileRepository();
