import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

import { createAuthRedirectUrl } from "@/src/infrastructure/auth/authRedirect";
import { toAuthenticationError } from "@/src/infrastructure/auth/authErrors";
import { withTimeout } from "@/src/ports/BackendAvailability";
import type { AuthResult, AuthService } from "@/src/ports/AuthService";
import { supabase } from "@/src/infrastructure/supabase/client";

WebBrowser.maybeCompleteAuthSession();

export const authRedirectTo = createAuthRedirectUrl(Linking.createURL);
const passwordRecoveryRedirectTo = `${authRedirectTo}${authRedirectTo.includes("?") ? "&" : "?"}recovery=true`;
const requestTimeoutMs = 15_000;

export class SupabaseAuthService implements AuthService {
  async getSession() {
    const { data, error } = await withTimeout(supabase.auth.getSession(), requestTimeoutMs);
    if (error) throw toAuthenticationError(error);
    return data.session;
  }

  async signUp(email: string, password: string): Promise<AuthResult> {
    const { data, error } = await withTimeout(supabase.auth.signUp({ email: normalizeEmail(email), password, options: { emailRedirectTo: authRedirectTo } }), requestTimeoutMs);
    if (error) throw toAuthenticationError(error);
    return { session: data.session, user: data.user, needsEmailConfirmation: data.session === null };
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    const { data, error } = await withTimeout(supabase.auth.signInWithPassword({ email: normalizeEmail(email), password }), requestTimeoutMs);
    if (error) throw toAuthenticationError(error);
    return { session: data.session, user: data.user, needsEmailConfirmation: false };
  }

  async signInWithGoogle(): Promise<AuthResult> {
    const { data, error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: authRedirectTo, skipBrowserRedirect: true } });
    if (error) throw toAuthenticationError(error);
    const result = await WebBrowser.openAuthSessionAsync(data.url, authRedirectTo);
    if (result.type !== "success") throw new Error("Google sign-in was cancelled.");
    const { params, errorCode } = QueryParams.getQueryParams(result.url);
    if (errorCode) throw new Error(String(params.error_description ?? errorCode));
    const code = typeof params.code === "string" ? params.code : null;
    if (!code) throw new Error("Google did not return an authorization code.");
    const exchanged = await supabase.auth.exchangeCodeForSession(code);
    if (exchanged.error) throw toAuthenticationError(exchanged.error);
    return { session: exchanged.data.session, user: exchanged.data.user, needsEmailConfirmation: false };
  }

  async completeSignIn(code: string): Promise<AuthResult> {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw toAuthenticationError(error);
    return { session: data.session, user: data.user, needsEmailConfirmation: false };
  }

  async sendPasswordReset(email: string): Promise<void> {
    const { error } = await withTimeout(supabase.auth.resetPasswordForEmail(normalizeEmail(email), { redirectTo: passwordRecoveryRedirectTo }), requestTimeoutMs);
    if (error) throw toAuthenticationError(error);
  }

  async updatePassword(password: string): Promise<void> {
    const { error } = await withTimeout(supabase.auth.updateUser({ password }), requestTimeoutMs);
    if (error) throw toAuthenticationError(error);
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw toAuthenticationError(error);
  }
}

export const authService = new SupabaseAuthService();

function normalizeEmail(email: string): string { return email.trim().toLocaleLowerCase(); }
