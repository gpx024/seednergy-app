import { useState } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useAuth } from "@/src/presentation/auth/AuthProvider";
import { AppButton, AppField, ScreenContainer } from "@/src/ui/components";
import { OnboardingHeader } from "@/src/ui/patterns/OnboardingHeader";
import { tokens } from "@/src/ui/tokens";

export default function SignInScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setLoading(true);
    setError(null);
    try {
      await auth.signIn(email, password);
      router.replace("/(tabs)/home");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t("onboarding.authError"));
    } finally {
      setLoading(false);
    }
  }

  return <ScreenContainer contentStyle={styles.container}><OnboardingHeader /><View style={styles.heading}><Text accessibilityRole="header" style={styles.title}>{t("onboarding.signInTitle")}</Text><Text style={styles.body}>{t("onboarding.signInBody")}</Text></View><View style={styles.fields}><AppField autoCapitalize="none" autoComplete="email" keyboardType="email-address" label={t("onboarding.email")} onChangeText={setEmail} value={email} /><AppField autoComplete="current-password" label={t("onboarding.password")} onChangeText={setPassword} secureTextEntry value={password} /></View>{error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}<View style={styles.actions}><AppButton disabled={!email || !password} label={t("onboarding.logIn")} loading={loading} onPress={signIn} /><AppButton label={t("onboarding.google")} onPress={() => auth.signInWithGoogle().then(() => router.replace("/(tabs)/home")).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : t("onboarding.authError")))} variant="olive" /><AppButton label={t("onboarding.forgot")} onPress={() => router.push("/(onboarding)/forgot-password")} variant="text" /></View></ScreenContainer>;
}

const styles = StyleSheet.create({ container: { gap: tokens.spacing.lg, paddingBottom: tokens.spacing.xl }, heading: { gap: tokens.spacing.sm, marginHorizontal: tokens.spacing.md }, title: { ...tokens.typography.displayLarge, color: tokens.colors.terracottaText }, body: { ...tokens.typography.body, color: tokens.colors.ink82 }, fields: { gap: tokens.spacing.md }, actions: { gap: tokens.spacing.sm, marginTop: "auto" }, error: { ...tokens.typography.caption, color: tokens.colors.terracottaText, textAlign: "center" } });
