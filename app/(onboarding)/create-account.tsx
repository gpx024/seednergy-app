import { useState } from "react";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppButton, AppField, ScreenContainer } from "@/src/ui/components";
import { OnboardingHeader } from "@/src/ui/patterns/OnboardingHeader";
import { tokens } from "@/src/ui/tokens";
import { featureFlags } from "@/src/config/features";
import { legalLinks } from "@/src/config/legal";
import { useAuth } from "@/src/presentation/auth/AuthProvider";

export default function CreateAccountScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(action: () => Promise<{ needsEmailConfirmation: boolean }>) {
    setLoading(true);
    setMessage(null);
    try {
      const result = await action();
      if (result.needsEmailConfirmation) setMessage(t("onboarding.confirmEmail"));
      else router.replace("/(onboarding)/profile-basics");
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : t("onboarding.authError"));
    } finally {
      setLoading(false);
    }
  }
  return (
    <ScreenContainer scroll contentStyle={styles.container}>
      <OnboardingHeader />
      <View style={styles.heading}><Text accessibilityRole="header" style={styles.title}>{t("onboarding.accountTitle")}</Text><Text style={styles.body}>{t("onboarding.accountBody")}</Text></View>
      <View style={styles.sso}>{featureFlags.appleAuthentication ? <AppButton disabled label={t("onboarding.apple")} variant="olive" /> : null}<AppButton disabled={loading} label={t("onboarding.google")} onPress={() => submit(() => auth.signInWithGoogle())} variant="olive" /></View>
      <View style={styles.divider}><View style={styles.line} /><Text style={styles.or}>{t("onboarding.or")}</Text><View style={styles.line} /></View>
      <View style={styles.fields}><AppField autoCapitalize="none" autoComplete="email" keyboardType="email-address" label={t("onboarding.email")} onChangeText={setEmail} placeholder="hello@example.com" value={email} /><AppField autoComplete="new-password" label={t("onboarding.password")} onChangeText={setPassword} placeholder="••••••••" secureTextEntry value={password} /></View>
      {message ? <Text accessibilityLiveRegion="polite" style={styles.message}>{message}</Text> : null}
      <AppButton disabled={!email || password.length < 6} label={t("actions.continue")} loading={loading} onPress={() => submit(() => auth.signUp(email, password))} style={styles.action} />
      <AppButton label={t("onboarding.haveAccount")} onPress={() => router.push("/(onboarding)/sign-in")} variant="text" />
      <Text style={styles.legal}>{t("onboarding.legalPrefix")}<Text accessibilityRole={legalLinks.terms ? "link" : undefined} onPress={legalLinks.terms ? () => void Linking.openURL(legalLinks.terms) : undefined} style={styles.legalLink}>{t("onboarding.termsOfService")}</Text>{t("onboarding.legalAnd")}<Text accessibilityRole={legalLinks.privacyPolicy ? "link" : undefined} onPress={legalLinks.privacyPolicy ? () => void Linking.openURL(legalLinks.privacyPolicy) : undefined} style={styles.legalLink}>{t("onboarding.privacyPolicy")}</Text></Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { gap: tokens.spacing.lg, paddingBottom: tokens.spacing.xl },
  heading: { gap: tokens.spacing.sm, marginHorizontal: tokens.spacing.md, marginTop: -10 },
  title: { ...tokens.typography.displayLarge, color: tokens.colors.terracottaText },
  body: { ...tokens.typography.body, color: tokens.colors.ink82 },
  sso: { gap: tokens.spacing.cardGap },
  divider: { alignItems: "center", flexDirection: "row", gap: tokens.spacing.sm },
  line: { backgroundColor: tokens.colors.sand, flex: 1, height: 1 },
  or: { ...tokens.typography.label, color: tokens.colors.oliveLabel, textAlign: "center", textTransform: "uppercase" },
  fields: { gap: tokens.spacing.md },
  action: { marginTop: "auto" },
  legal: { ...tokens.typography.caption, color: tokens.colors.ink64, textAlign: "center", marginHorizontal: tokens.spacing.md },
  legalLink: { color: tokens.colors.terracottaText },
  message: { ...tokens.typography.caption, color: tokens.colors.terracottaText, textAlign: "center" }
});
