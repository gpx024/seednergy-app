import { createBrowserClient } from "@supabase/ssr";

import { getPublicEnv } from "@/lib/env";

let client: ReturnType<typeof createBrowserClient> | undefined;

export function createSupabaseBrowserClient() {
  const { url, key } = getPublicEnv();
  client ??= createBrowserClient(url, key);
  return client;
}
