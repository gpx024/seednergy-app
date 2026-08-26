export type AnalyticsEventName = "app_opened" | "onboarding_completed" | "cycle_started" | "cycle_action_completed" | "photo_check_started" | "photo_check_completed" | "harvest_completed" | "garden_opened" | "notification_preference_changed" | "account_deletion_requested";
export type AnalyticsProperties = Partial<Record<"screen" | "source" | "status" | "seed_slug" | "cycle_day", string | number>>;

export interface AnalyticsService {
  track(eventName: AnalyticsEventName, properties?: AnalyticsProperties): Promise<void>;
}
