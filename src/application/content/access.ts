import type { SeedAccessType } from "@/src/domain/content";

export type SeedAccessState = "available" | "locked" | "comingSoon";

export function resolveSeedAccess(accessType: SeedAccessType, hasPaidAccess = false): { state: SeedAccessState; canStart: boolean } {
  if (accessType === "coming_soon") return { state: "comingSoon", canStart: false };
  if (accessType === "paid" && !hasPaidAccess) return { state: "locked", canStart: false };
  return { state: "available", canStart: true };
}

