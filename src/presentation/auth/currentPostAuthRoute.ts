import { cycleRepository } from "@/src/infrastructure/repositories/SupabaseCycleRepository";
import { profileRepository } from "@/src/infrastructure/repositories/SupabaseProfileRepository";
import { resolvePostAuthenticationRoute } from "@/src/presentation/auth/postAuthRoute";

export function resolveCurrentPostAuthenticationRoute() {
  return resolvePostAuthenticationRoute(profileRepository, cycleRepository);
}
