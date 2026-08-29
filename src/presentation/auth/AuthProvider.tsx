import type { Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from "react";
import { AppState, Platform } from "react-native";

import { authService } from "@/src/infrastructure/auth/SupabaseAuthService";
import { analyticsService } from "@/src/infrastructure/analytics/SupabaseAnalyticsService";
import { clearPrivateCache } from "@/src/infrastructure/cache/resourceCache";
import { supabase } from "@/src/infrastructure/supabase/client";
import type { AuthResult } from "@/src/ports/AuthService";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: Error | null;
  signUp(email: string, password: string): Promise<AuthResult>;
  signIn(email: string, password: string): Promise<AuthResult>;
  signInWithGoogle(): Promise<AuthResult>;
  completeSignIn(code: string): Promise<AuthResult>;
  sendPasswordReset(email: string): Promise<void>;
  updatePassword(password: string): Promise<void>;
  signOut(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const trackedUserId = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;
    authService.getSession().then((nextSession) => {
      if (mounted) setSession(nextSession);
    }).catch((reason: unknown) => {
      if (mounted) setError(toError(reason));
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setError(null);
      setLoading(false);
    });
    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const userId = session?.user.id ?? null;
    if (!userId || trackedUserId.current === userId) return;
    trackedUserId.current = userId;
    void analyticsService.track("app_opened").catch(() => undefined);
  }, [session?.user.id]);

  useEffect(() => {
    if (Platform.OS === "web") return;
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") supabase.auth.startAutoRefresh();
      else supabase.auth.stopAutoRefresh();
    });
    return () => subscription.remove();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    user: session?.user ?? null,
    loading,
    error,
    signUp: (email, password) => authService.signUp(email, password),
    signIn: (email, password) => authService.signIn(email, password),
    signInWithGoogle: () => authService.signInWithGoogle(),
    completeSignIn: (code) => authService.completeSignIn(code),
    sendPasswordReset: (email) => authService.sendPasswordReset(email),
    updatePassword: (password) => authService.updatePassword(password),
    async signOut() {
      const userId = session?.user.id;
      await authService.signOut();
      if (userId) await clearPrivateCache(userId);
    }
  }), [error, loading, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider.");
  return value;
}

function toError(reason: unknown): Error {
  return reason instanceof Error ? reason : new Error("Authentication failed.");
}
