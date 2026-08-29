import * as Sentry from "@sentry/react-native";

import { environment } from "@/src/config/env";
import { redactSensitiveString, sanitizeMonitoringEvent } from "@/src/infrastructure/monitoring/privacy";

export function initializeMonitoring(): void {
  Sentry.init({
    dsn: environment.EXPO_PUBLIC_SENTRY_DSN || undefined,
    enabled: environment.EXPO_PUBLIC_SENTRY_DSN.length > 0,
    environment: environment.EXPO_PUBLIC_APP_ENV,
    sendDefaultPii: false,
    tracesSampleRate: 0,
    beforeSend(event) {
      return sanitizeMonitoringEvent(event);
    },
    beforeBreadcrumb(breadcrumb) {
      return {
        category: breadcrumb.category,
        level: breadcrumb.level,
        message: breadcrumb.message ? redactSensitiveString(breadcrumb.message) : undefined,
        timestamp: breadcrumb.timestamp,
        type: breadcrumb.type
      };
    }
  });
}

export async function sendMonitoringVerificationEvent(): Promise<{ eventId: string; flushed: boolean }> {
  if (!environment.EXPO_PUBLIC_SENTRY_DSN) throw new Error("Monitoring is not configured for this build.");
  const eventId = Sentry.captureException(new Error("Seednergy monitoring verification"), {
    tags: { verification: "stage11" }
  });
  return { eventId, flushed: await Sentry.flush() };
}

export function triggerNativeMonitoringCrash(): void {
  if (!environment.EXPO_PUBLIC_SENTRY_DSN) throw new Error("Monitoring is not configured for this build.");
  Sentry.nativeCrash();
}

export const wrapWithMonitoring = Sentry.wrap;
