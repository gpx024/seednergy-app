export function createAuthRedirectUrl(createUrl: (path: string) => string): string {
  return createUrl("auth/callback");
}
