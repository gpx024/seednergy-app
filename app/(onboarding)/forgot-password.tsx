import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppButton, AppField, ScreenContainer } from "@/src/ui/components";
import { OnboardingHeader } from "@/src/ui/patterns/OnboardingHeader";
import { tokens } from "@/src/ui/tokens";

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  return <ScreenContainer contentStyle={styles.container}><OnboardingHeader /><View style={styles.heading}><Text accessibilityRole="header" style={styles.title}>{t("onboarding.forgotTitle")}</Text><Text style={styles.body}>{t("onboarding.forgotBody")}</Text></View><AppField autoCapitalize="none" keyboardType="email-address" label={t("onboarding.email")} placeholder="hello@example.com" /><View style={styles.actions}><AppButton label={t("onboarding.sendReset")} onPress={() => router.back()} /><AppButton label={t("onboarding.backToLogin")} onPress={() => router.back()} variant="text" /></View></ScreenContainer>;
}

const styles = StyleSheet.create({ container: { gap: tokens.spacing.xl }, heading: { gap: tokens.spacing.sm, marginHorizontal: tokens.spacing.md }, title: { ...tokens.typography.display, color: tokens.colors.terracotta }, body: { ...tokens.typography.body, color: tokens.colors.ink82 }, actions: { gap: tokens.spacing.xs, marginTop: "auto", paddingBottom: tokens.spacing.xl } });
