import { Link, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppButton, AppField, ScreenContainer } from "@/src/ui/components";
import { OnboardingHeader } from "@/src/ui/patterns/OnboardingHeader";
import { tokens } from "@/src/ui/tokens";

export default function CreateAccountScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <ScreenContainer scroll contentStyle={styles.container}>
      <OnboardingHeader />
      <View style={styles.heading}><Text accessibilityRole="header" style={styles.title}>{t("onboarding.accountTitle")}</Text><Text style={styles.body}>{t("onboarding.accountBody")}</Text></View>
      <View style={styles.sso}><AppButton label={t("onboarding.apple")} variant="secondary" /><AppButton label={t("onboarding.google")} variant="secondary" /></View>
      <Text style={styles.or}>{t("onboarding.or")}</Text>
      <View style={styles.fields}><AppField autoCapitalize="none" keyboardType="email-address" label={t("onboarding.email")} placeholder="hello@example.com" /><AppField label={t("onboarding.password")} placeholder="••••••••" secureTextEntry /></View>
      <Link href="/(onboarding)/forgot-password" style={styles.forgot}>{t("onboarding.forgot")}</Link>
      <AppButton label={t("actions.continue")} onPress={() => router.push("/(onboarding)/profile-basics")} style={styles.action} />
      <Text style={styles.legal}>{t("onboarding.legalReview")}</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { gap: tokens.spacing.lg, paddingBottom: tokens.spacing.xl },
  heading: { gap: tokens.spacing.sm },
  title: { ...tokens.typography.display, color: tokens.colors.terracotta },
  body: { ...tokens.typography.body, color: tokens.colors.ink82 },
  sso: { gap: tokens.spacing.cardGap },
  or: { ...tokens.typography.label, color: tokens.colors.oliveLabel, textAlign: "center", textTransform: "uppercase" },
  fields: { gap: tokens.spacing.md },
  forgot: { ...tokens.typography.caption, color: tokens.colors.terracottaText, textAlign: "right" },
  action: { marginTop: "auto" },
  legal: { ...tokens.typography.caption, color: tokens.colors.ink64, textAlign: "center" }
});
