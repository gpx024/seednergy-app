import { supabase } from "@/src/infrastructure/supabase/client";
import type { AnalyticsEventName, AnalyticsProperties, AnalyticsService } from "@/src/ports/AnalyticsService";

export class SupabaseAnalyticsService implements AnalyticsService {
  async track(eventName: AnalyticsEventName, properties: AnalyticsProperties = {}): Promise<void> {
    const { error } = await supabase.rpc("record_analytics_event", { p_event_name: eventName, p_properties: properties, p_occurred_at: new Date().toISOString() });
    if (error) throw error;
  }
}

export const analyticsService = new SupabaseAnalyticsService();
