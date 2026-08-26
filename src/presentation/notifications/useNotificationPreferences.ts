import { useEffect, useState } from "react";

import { defaults, notificationService } from "@/src/infrastructure/notifications/ExpoNotificationService";
import { toNotificationPreferencesError } from "@/src/presentation/notifications/notificationErrors";
import type { NotificationPreferences } from "@/src/ports/NotificationService";

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    void notificationService.getPreferences().then(setPreferences).catch((reason: unknown) => setError(toError(reason))).finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true); setError(null);
    const enabling = preferences.enabled;
    try {
      if (preferences.enabled) await notificationService.enable(preferences);
      else await notificationService.disable(preferences);
    } catch (reason) {
      if (enabling) setPreferences((current) => ({ ...current, enabled: false }));
      const nextError = toNotificationPreferencesError(reason); setError(nextError); throw nextError;
    } finally { setSaving(false); }
  }

  return { preferences, setPreferences, loading, saving, error, save };
}

function toError(reason: unknown) { return reason instanceof Error ? reason : new Error("Notification preferences could not be loaded."); }
