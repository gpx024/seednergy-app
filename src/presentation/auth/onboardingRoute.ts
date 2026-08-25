const authenticatedOnboardingRoutes = new Set([
  "profile-basics",
  "light",
  "time",
  "motivation",
  "first-cycle",
  "seed-selection",
  "ready",
  "notifications"
]);

export function requiresAuthenticatedOnboardingRoute(route: string | undefined): boolean {
  return route !== undefined && authenticatedOnboardingRoutes.has(route);
}
