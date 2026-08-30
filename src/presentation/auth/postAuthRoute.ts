import type { CycleRepository } from "@/src/ports/CycleRepository";
import type { ProfileRepository } from "@/src/ports/ProfileRepository";

export type PostAuthenticationRoute = "/(tabs)/home" | "/(onboarding)/profile-basics";

export async function resolvePostAuthenticationRoute(
  profiles: Pick<ProfileRepository, "getMine">,
  cycles: Pick<CycleRepository, "getAll">
): Promise<PostAuthenticationRoute> {
  try {
    const profile = await profiles.getMine();
    if (profile?.onboardingCompletedAt) return "/(tabs)/home";
    const existingCycles = await cycles.getAll();
    return existingCycles.length > 0 ? "/(tabs)/home" : "/(onboarding)/profile-basics";
  } catch {
    // A temporary backend failure must never misclassify an existing grower as new.
    return "/(tabs)/home";
  }
}
