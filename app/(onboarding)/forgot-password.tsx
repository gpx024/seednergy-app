import { useState } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppButton, AppField, ScreenContainer } from "@/src/ui/components";
import { OnboardingHeader } from "@/src/ui/patterns/OnboardingHeader";
import { tokens } from "@/src/ui/tokens";
import { useAuth } from "@/src/presentation/auth/AuthProvider";

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  async function reset() { setLoading(true); try { await auth.sendPasswordReset(email); setMessage(t("onboarding.resetSent")); } catch (reason) { setMessage(reason instanceof Error ? reason.message : t("onboarding.authError")); } finally { setLoading(false); } }
  return <ScreenContainer contentStyle={styles.container}><OnboardingHeader /><View style={styles.heading}><Text accessibilityRole="header" style={styles.title}>{t("onboarding.forgotTitle")}</Text><Text style={styles.body}>{t("onboarding.forgotBody")}</Text></View><AppField autoCapitalize="none" keyboardType="email-address" label={t("onboarding.email")} onChangeText={setEmail} placeholder="hello@example.com" value={email} />{message ? <Text style={styles.message}>{message}</Text> : null}<View style={styles.actions}><AppButton disabled={!email} label={t("onboarding.sendReset")} loading={loading} onPress={reset} /><AppButton label={t("onboarding.backToLogin")} onPress={() => router.back()} variant="text" /></View></ScreenContainer>;
}

const styles = StyleSheet.create({ container: { gap: tokens.spacing.xl }, heading: { gap: tokens.spacing.sm, marginHorizontal: tokens.spacing.md }, title: { ...tokens.typography.display, color: tokens.colors.terracotta }, body: { ...tokens.typography.body, color: tokens.colors.ink82 }, actions: { gap: tokens.spacing.xs, marginTop: "auto", paddingBottom: tokens.spacing.xl }, message: { ...tokens.typography.caption, color: tokens.colors.oliveLabel, textAlign: "center" } });
