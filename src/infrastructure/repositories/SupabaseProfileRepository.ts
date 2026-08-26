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

  async acceptAiPhotoNotice(): Promise<GrowerProfile> {
    const { data, error } = await supabase.rpc("accept_ai_photo_notice");
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
    onboardingCompletedAt: row.onboarding_completed_at,
    aiPhotoNoticeAcceptedAt: row.ai_photo_notice_accepted_at,
    notificationPreferences: parseNotificationPreferences(row.notification_prefs, row.quiet_hours)
  };
}

function parseNotificationPreferences(preferences: ProfileRow["notification_prefs"], quietHours: ProfileRow["quiet_hours"]): GrowerProfile["notificationPreferences"] {
  const prefs = typeof preferences === "object" && preferences !== null && !Array.isArray(preferences) ? preferences : {};
  const quiet = typeof quietHours === "object" && quietHours !== null && !Array.isArray(quietHours) ? quietHours : {};
  const frequency = prefs.frequency;
  return {
    enabled: prefs.enabled === true,
    frequency: frequency === "every_other_day" || frequency === "important_only" ? frequency : "daily",
    quietStart: typeof quiet.start === "string" ? quiet.start : "21:00",
    quietEnd: typeof quiet.end === "string" ? quiet.end : "08:00"
  };
}

export const profileRepository = new SupabaseProfileRepository();
