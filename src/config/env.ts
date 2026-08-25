import { z } from "zod";

const publicEnvironmentSchema = z.object({
  EXPO_PUBLIC_APP_ENV: z.enum(["development", "preview", "production"]).default("development"),
  EXPO_PUBLIC_ENABLE_DEV_ROUTES: z.enum(["true", "false"]).default("true").transform((value) => value === "true"),
  EXPO_PUBLIC_SUPABASE_URL: z.string().url().optional().default("https://example.supabase.co"),
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().optional().default(""),
  EXPO_PUBLIC_ENABLE_APPLE_AUTH: z.enum(["true", "false"]).default("false").transform((value) => value === "true")
});

export type PublicEnvironment = z.infer<typeof publicEnvironmentSchema>;

export function parsePublicEnvironment(input: Record<string, string | undefined>): PublicEnvironment {
  return publicEnvironmentSchema.parse(input);
}

export const environment = parsePublicEnvironment(process.env);

export const isSupabaseConfigured = environment.EXPO_PUBLIC_SUPABASE_URL !== "https://example.supabase.co" && environment.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.length > 0;
