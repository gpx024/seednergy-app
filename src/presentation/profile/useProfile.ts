import { useCallback, useEffect, useState } from "react";
import { profileRepository } from "@/src/infrastructure/repositories/SupabaseProfileRepository";
import type { GrowerProfile } from "@/src/ports/ProfileRepository";

export function useProfile() {
  const [data, setData] = useState<GrowerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const reload = useCallback(async () => {
    setLoading(true); setError(null);
    try { setData(await profileRepository.getMine()); }
    catch (reason) { setError(reason instanceof Error ? reason : new Error("Profile could not be loaded.")); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void reload(); }, [reload]);
  return { data, loading, error, reload };
}
