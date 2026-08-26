const androidFirebaseErrorFragments = [
  "default firebaseapp is not initialized",
  "fcm-credentials"
] as const;

export function toNotificationPreferencesError(reason: unknown): Error {
  const error = reason instanceof Error ? reason : new Error("Notification preferences could not be saved.");
  const normalizedMessage = error.message.toLowerCase();

  if (androidFirebaseErrorFragments.some((fragment) => normalizedMessage.includes(fragment))) {
    return new Error("Push notifications are not configured in this Android build yet. Install a new Firebase-enabled Seednergy build before enabling reminders.");
  }

  return error;
}
