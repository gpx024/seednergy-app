import * as Sentry from "@sentry/react-native";

import { environment } from "@/src/config/env";

export function initializeMonitoring(): void {
  Sentry.init({
    dsn: environment.EXPO_PUBLIC_SENTRY_DSN || undefined,
    enabled: environment.EXPO_PUBLIC_SENTRY_DSN.length > 0,
    environment: environment.EXPO_PUBLIC_APP_ENV,
    sendDefaultPii: false,
    tracesSampleRate: 0,
    beforeSend(event) {
      if (event.user) event.user = event.user.id ? { id: event.user.id } : undefined;
      if (event.request) delete event.request.cookies;
      return event;
    }
  });
}

export const wrapWithMonitoring = Sentry.wrap;
