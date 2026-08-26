import { useState } from "react";

import { accountService } from "@/src/infrastructure/account/SupabaseAccountService";
import { analyticsService } from "@/src/infrastructure/analytics/SupabaseAnalyticsService";

export function useDeleteAccount() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  async function deleteAccount() {
    setLoading(true); setError(null);
    try {
      await analyticsService.track("account_deletion_requested").catch(() => undefined);
      await accountService.deleteCurrentAccount();
    } catch (reason) {
      const nextError = reason instanceof Error ? reason : new Error("Your account could not be deleted.");
      setError(nextError); throw nextError;
    } finally { setLoading(false); }
  }
  return { deleteAccount, loading, error };
}
