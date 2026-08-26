import { useEffect } from "react";

import { analyticsService } from "@/src/infrastructure/analytics/SupabaseAnalyticsService";
import type { AnalyticsEventName, AnalyticsProperties } from "@/src/ports/AnalyticsService";

export function useAnalyticsEvent(eventName: AnalyticsEventName, properties?: AnalyticsProperties): void {
  useEffect(() => { void analyticsService.track(eventName, properties).catch(() => undefined); }, [eventName, properties]);
}
