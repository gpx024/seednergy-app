import { z } from "zod";

const publicEnvironmentSchema = z.object({
  EXPO_PUBLIC_APP_ENV: z.enum(["development", "preview", "production"]).default("development"),
  EXPO_PUBLIC_ENABLE_DEV_ROUTES: z.enum(["true", "false"]).default("true").transform((value) => value === "true")
});

export type PublicEnvironment = z.infer<typeof publicEnvironmentSchema>;

export function parsePublicEnvironment(input: Record<string, string | undefined>): PublicEnvironment {
  return publicEnvironmentSchema.parse(input);
}

export const environment = parsePublicEnvironment(process.env);
