import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppButton, BrandMark, ScreenContainer } from "@/src/ui/components";
import { tokens } from "@/src/ui/tokens";

export default function WelcomeScreen() {
  const { t } = useTranslation();
  return (
    <ScreenContainer contentStyle={styles.container}>
      <View style={styles.brand}><BrandMark width={42} /><Text accessibilityRole="header" style={styles.wordmark}>Seednergy</Text><Text style={styles.kicker}>{t("onboarding.splashKicker")}</Text></View>
      <Link asChild href="/(onboarding)/how-it-works"><AppButton label={t("actions.continue")} /></Link>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: "space-between", paddingBottom: tokens.spacing.xl },
  brand: { alignItems: "center", flex: 1, gap: tokens.spacing.sm, justifyContent: "center" },
  wordmark: { fontFamily: "CrimsonText_600SemiBold", fontSize: 36, lineHeight: 40, color: tokens.colors.ink },
  kicker: { ...tokens.typography.label, color: tokens.colors.oliveLabel, textTransform: "uppercase" }
});
