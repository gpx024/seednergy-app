import { describe, expect, it, vi } from "vitest";

import { AuthenticationError, toAuthenticationError } from "@/src/infrastructure/auth/authErrors";
import { BackendUnavailableError, isBackendUnavailable, withTimeout } from "@/src/ports/BackendAvailability";
import { createPrivateCacheKey, createPublicCacheKey } from "@/src/infrastructure/cache/resourceCache";

describe("Stage 4 authentication and backend reliability", () => {
  it("maps provider errors to stable user-safe authentication errors", () => {
    expect(toAuthenticationError(new Error("Invalid login credentials")).code).toBe("INVALID_CREDENTIALS");
    expect(toAuthenticationError(new Error("Email not confirmed")).code).toBe("EMAIL_NOT_CONFIRMED");
    expect(toAuthenticationError(new Error("Network request failed")).code).toBe("OFFLINE");
    expect(toAuthenticationError(new Error("provider internals leaked")).message).not.toContain("provider internals");
  });

  it("recognises common native and web connectivity failures", () => {
    expect(isBackendUnavailable(new Error("Failed to fetch"))).toBe(true);
    expect(isBackendUnavailable(new Error("Network request failed"))).toBe(true);
    expect(isBackendUnavailable(new Error("Invalid login credentials"))).toBe(false);
  });

  it("bounds requests that never settle", async () => {
    vi.useFakeTimers();
    const result = withTimeout(new Promise<never>(() => undefined), 1000);
    const expectation = expect(result).rejects.toBeInstanceOf(BackendUnavailableError);
    await vi.advanceTimersByTimeAsync(1000);
    await expectation;
    vi.useRealTimers();
  });

  it("separates public content and private per-user caches", () => {
    expect(createPublicCacheKey("seed-library")).toBe("seednergy.cache.v1.public.seed-library");
    expect(createPrivateCacheKey("user-a", "cycles-active")).not.toBe(createPrivateCacheKey("user-b", "cycles-active"));
  });

  it("does not leak raw provider messages through known errors", () => {
    const error = toAuthenticationError(new Error("Invalid login credentials: internal detail"));
    expect(error).toBeInstanceOf(AuthenticationError);
    expect(error.message).toBe("That email and password do not match.");
  });
});
