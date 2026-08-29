import { z } from "zod";

const publicEnvironmentSchema = z.object({
  EXPO_PUBLIC_APP_ENV: z.enum(["development", "preview", "production"]).default("development"),
  EXPO_PUBLIC_ENABLE_DEV_ROUTES: z.enum(["true", "false"]).default("true").transform((value) => value === "true"),
  EXPO_PUBLIC_ENABLE_EMAIL_AUTH: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),
  EXPO_PUBLIC_ENABLE_PAYMENTS: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),
  EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),
  EXPO_PUBLIC_ENABLE_MONITORING_VERIFICATION: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),
  EXPO_PUBLIC_SUPABASE_URL: z.string().url().optional().default("https://example.supabase.co"),
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().optional().default(""),
  EXPO_PUBLIC_ENABLE_APPLE_AUTH: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),
  EXPO_PUBLIC_PHOTO_CHECK_PROVIDER: z.enum(["live", "fixture"]).default("live"),
  EXPO_PUBLIC_PRIVACY_POLICY_URL: z.union([z.string().url(), z.literal("")]).default(""),
  EXPO_PUBLIC_TERMS_URL: z.union([z.string().url(), z.literal("")]).default(""),
  EXPO_PUBLIC_SUPPORT_URL: z.union([z.string().url(), z.literal("")]).default(""),
  EXPO_PUBLIC_SENTRY_DSN: z.union([z.string().url(), z.literal("")]).default("")
});

export type PublicEnvironment = z.infer<typeof publicEnvironmentSchema>;

export function parsePublicEnvironment(input: Record<string, string | undefined>): PublicEnvironment {
  return publicEnvironmentSchema.parse(input);
}

// Expo replaces EXPO_PUBLIC_* values only when they are referenced with static
// dot notation. Passing the entire process.env object leaves release builds on
// schema defaults because Metro cannot inline dynamic property access.
export const environment = parsePublicEnvironment({
  EXPO_PUBLIC_APP_ENV: process.env.EXPO_PUBLIC_APP_ENV,
  EXPO_PUBLIC_ENABLE_DEV_ROUTES: process.env.EXPO_PUBLIC_ENABLE_DEV_ROUTES,
  EXPO_PUBLIC_ENABLE_EMAIL_AUTH: process.env.EXPO_PUBLIC_ENABLE_EMAIL_AUTH,
  EXPO_PUBLIC_ENABLE_PAYMENTS: process.env.EXPO_PUBLIC_ENABLE_PAYMENTS,
  EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS: process.env.EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS,
  EXPO_PUBLIC_ENABLE_MONITORING_VERIFICATION: process.env.EXPO_PUBLIC_ENABLE_MONITORING_VERIFICATION,
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  EXPO_PUBLIC_ENABLE_APPLE_AUTH: process.env.EXPO_PUBLIC_ENABLE_APPLE_AUTH,
  EXPO_PUBLIC_PHOTO_CHECK_PROVIDER: process.env.EXPO_PUBLIC_PHOTO_CHECK_PROVIDER,
  EXPO_PUBLIC_PRIVACY_POLICY_URL: process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL,
  EXPO_PUBLIC_TERMS_URL: process.env.EXPO_PUBLIC_TERMS_URL,
  EXPO_PUBLIC_SUPPORT_URL: process.env.EXPO_PUBLIC_SUPPORT_URL,
  EXPO_PUBLIC_SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN
});

export const isSupabaseConfigured = environment.EXPO_PUBLIC_SUPABASE_URL !== "https://example.supabase.co" && environment.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.length > 0;
