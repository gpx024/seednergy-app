export function sanitizeMonitoringEvent<T extends object>(event: T): T {
  const record = event as Record<string, unknown>;
  delete record.user;
  delete record.request;
  delete record.extra;
  redactValue(event);
  return event;
}

export function redactSensitiveString(value: string): string {
  return value
    .replace(/Bearer\s+[A-Za-z0-9._~+\/-]+/gi, "Bearer [redacted]")
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[redacted-email]")
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, "[redacted-token]")
    .replace(/([?&](?:access_token|refresh_token|token|code|password|signature)=)[^&\s]+/gi, "$1[redacted]")
    .replace(/(?:data:image\/[^;]+;base64,[A-Za-z0-9+/=]+|(?:file|content):\/\/\S+\.(?:jpe?g|png|webp|heic))/gi, "[redacted-photo]");
}

function redactValue(value: unknown, seen = new WeakSet<object>()): void {
  if (!value || typeof value !== "object") return;
  if (seen.has(value)) return;
  seen.add(value);
  for (const [key, nested] of Object.entries(value)) {
    if (/email|password|token|authorization|cookie|photo|image|avatar/i.test(key)) {
      (value as Record<string, unknown>)[key] = "[redacted]";
    } else if (typeof nested === "string") {
      (value as Record<string, unknown>)[key] = redactSensitiveString(nested);
    } else {
      redactValue(nested, seen);
    }
  }
}
