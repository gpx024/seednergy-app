export type BackendAvailabilityCode = "OFFLINE" | "TIMEOUT" | "BACKEND_UNAVAILABLE";

export class BackendUnavailableError extends Error {
  constructor(readonly code: BackendAvailabilityCode, message = "Seednergy cannot reach its service right now.", options?: ErrorOptions) {
    super(message, options);
    this.name = "BackendUnavailableError";
  }
}

export function isBackendUnavailable(reason: unknown): boolean {
  if (reason instanceof BackendUnavailableError) return true;
  const message = reason instanceof Error ? `${reason.name} ${reason.message}` : String(reason);
  return /network request failed|failed to fetch|fetch failed|load failed|timed? ?out|timeout|econn|unable to resolve host|internet connection|offline/i.test(message);
}

export async function withTimeout<T>(operation: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new BackendUnavailableError("TIMEOUT")), timeoutMs);
      })
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
