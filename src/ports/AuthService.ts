import type { Session, User } from "@supabase/supabase-js";

export interface AuthResult {
  session: Session | null;
  user: User | null;
  needsEmailConfirmation: boolean;
}

export interface AuthService {
  getSession(): Promise<Session | null>;
  signUp(email: string, password: string): Promise<AuthResult>;
  signIn(email: string, password: string): Promise<AuthResult>;
  signInWithGoogle(): Promise<AuthResult>;
  completeSignIn(code: string): Promise<AuthResult>;
  sendPasswordReset(email: string): Promise<void>;
  updatePassword(password: string): Promise<void>;
  signOut(): Promise<void>;
}
