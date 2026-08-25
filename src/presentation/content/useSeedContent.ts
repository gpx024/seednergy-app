import { useCallback, useEffect, useMemo, useState } from "react";

import { contentRepository } from "@/src/infrastructure/repositories/SupabaseContentRepository";
import type { PublishedSeed, SeedSummary } from "@/src/ports/ContentRepository";

type QueryState<T> = { data: T; error: string | null; loading: boolean; retry: () => void };

export function useSeedLibrary(query: string): QueryState<readonly SeedSummary[]> {
  const state = useContentQuery(() => contentRepository.getLibrary(), [] as readonly SeedSummary[]);
  const normalized = query.trim().toLocaleLowerCase();
  const data = useMemo(() => normalized ? state.data.filter((seed) => `${seed.commonName} ${seed.description}`.toLocaleLowerCase().includes(normalized)) : state.data, [normalized, state.data]);
  return { ...state, data };
}

export function usePublishedSeed(slug: string): QueryState<PublishedSeed | null> {
  return useContentQuery(() => contentRepository.getPublishedSeed(slug), null, [slug]);
}

function useContentQuery<T>(loader: () => Promise<T>, initial: T, dependencies: readonly unknown[] = []): QueryState<T> {
  const [data, setData] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  useEffect(() => {
    let current = true;
    setLoading(true);
    setError(null);
    loader().then((result) => { if (current) setData(result); }).catch((reason: unknown) => { if (current) setError(reason instanceof Error ? reason.message : "Seed content is unavailable."); }).finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
    // The caller supplies stable primitive dependencies for each query.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt, ...dependencies]);

  return { data, error, loading, retry };
}
