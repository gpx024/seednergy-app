import { useState } from "react";
import { Share } from "react-native";

import { accountService } from "@/src/infrastructure/account/SupabaseAccountService";
import { analyticsService } from "@/src/infrastructure/analytics/SupabaseAnalyticsService";

export function useDeleteAccount() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [exporting, setExporting] = useState(false);
  async function exportData() {
    setExporting(true); setError(null);
    try {
      const data = await accountService.exportCurrentAccount();
      await Share.share({ title: "Seednergy data export", message: JSON.stringify(data, null, 2) });
    } catch (reason) {
      const nextError = reason instanceof Error ? reason : new Error("Your data export could not be created.");
      setError(nextError); throw nextError;
    } finally { setExporting(false); }
  }
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
  return { deleteAccount, exportData, exporting, loading, error };
}
