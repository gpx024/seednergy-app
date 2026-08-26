import { useState } from "react";

import { profileRepository } from "@/src/infrastructure/repositories/SupabaseProfileRepository";

export function useAcceptAiPhotoNotice() {
  const [loading, setLoading] = useState(false); const [error, setError] = useState<Error | null>(null);
  async function accept() { setLoading(true); setError(null); try { return await profileRepository.acceptAiPhotoNotice(); } catch (reason) { const nextError = reason instanceof Error ? reason : new Error("Your choice could not be saved."); setError(nextError); throw nextError; } finally { setLoading(false); } }
  return { accept, loading, error };
}
