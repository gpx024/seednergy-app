import { BackendUnavailableError, isBackendUnavailable } from "@/src/ports/BackendAvailability";

export type AuthErrorCode = "INVALID_CREDENTIALS" | "EMAIL_NOT_CONFIRMED" | "RATE_LIMITED" | "OFFLINE" | "UNKNOWN";

export class AuthenticationError extends Error {
  constructor(readonly code: AuthErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "AuthenticationError";
  }
}

export function toAuthenticationError(reason: unknown): AuthenticationError {
  if (reason instanceof AuthenticationError) return reason;
  if (reason instanceof BackendUnavailableError || isBackendUnavailable(reason)) return new AuthenticationError("OFFLINE", "Seednergy cannot connect right now. Check your connection and try again.", { cause: reason });
  const message = reason instanceof Error ? reason.message : String(reason);
  if (/invalid login credentials/i.test(message)) return new AuthenticationError("INVALID_CREDENTIALS", "That email and password do not match.", { cause: reason });
  if (/email not confirmed/i.test(message)) return new AuthenticationError("EMAIL_NOT_CONFIRMED", "Confirm your email before logging in.", { cause: reason });
  if (/rate limit|too many requests/i.test(message)) return new AuthenticationError("RATE_LIMITED", "Too many attempts. Wait a moment and try again.", { cause: reason });
  return new AuthenticationError("UNKNOWN", "We could not complete authentication. Please try again.", { cause: reason });
}
