import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";

import type { AuthResult, AuthService } from "@/src/ports/AuthService";
import { supabase } from "@/src/infrastructure/supabase/client";

WebBrowser.maybeCompleteAuthSession();

const redirectTo = makeRedirectUri({ scheme: "seednergy", path: "auth/callback" });

export class SupabaseAuthService implements AuthService {
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  }

  async signUp(email: string, password: string): Promise<AuthResult> {
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: redirectTo } });
    if (error) throw error;
    return { session: data.session, user: data.user, needsEmailConfirmation: data.session === null };
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw error;
    return { session: data.session, user: data.user, needsEmailConfirmation: false };
  }

  async signInWithGoogle(): Promise<AuthResult> {
    const { data, error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo, skipBrowserRedirect: true } });
    if (error) throw error;
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== "success") throw new Error("Google sign-in was cancelled.");
    const { params, errorCode } = QueryParams.getQueryParams(result.url);
    if (errorCode) throw new Error(String(params.error_description ?? errorCode));
    const code = typeof params.code === "string" ? params.code : null;
    if (!code) throw new Error("Google did not return an authorization code.");
    const exchanged = await supabase.auth.exchangeCodeForSession(code);
    if (exchanged.error) throw exchanged.error;
    return { session: exchanged.data.session, user: exchanged.data.user, needsEmailConfirmation: false };
  }

  async sendPasswordReset(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
    if (error) throw error;
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
}

export const authService = new SupabaseAuthService();
