import "react-native-url-polyfill/auto";

import { createClient } from "@supabase/supabase-js";

import { environment } from "@/src/config/env";
import { authStorage } from "@/src/infrastructure/supabase/storage";

export const supabase = createClient(environment.EXPO_PUBLIC_SUPABASE_URL, environment.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "unconfigured", {
  auth: {
    storage: authStorage,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    persistSession: true,
    flowType: "pkce"
  }
});
