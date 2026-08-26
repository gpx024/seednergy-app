import { supabase } from "@/src/infrastructure/supabase/client";
import type { AccountService } from "@/src/ports/AccountService";

export class SupabaseAccountService implements AccountService {
  async deleteCurrentAccount(): Promise<void> {
    const { error } = await supabase.functions.invoke("delete-account", { body: {} });
    if (error) throw new Error(await functionErrorMessage(error));
    const { error: signOutError } = await supabase.auth.signOut({ scope: "local" });
    if (signOutError) throw signOutError;
  }
}

async function functionErrorMessage(error: unknown): Promise<string> {
  const fallback = error instanceof Error ? error.message : "Your account could not be deleted.";
  const context = typeof error === "object" && error !== null && "context" in error ? (error as { context?: unknown }).context : null;
  if (!(context instanceof Response)) return fallback;
  try {
    const body = await context.clone().json() as { message?: string };
    return body.message ?? fallback;
  } catch { return fallback; }
}

export const accountService = new SupabaseAccountService();
