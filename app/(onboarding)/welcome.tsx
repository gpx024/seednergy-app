import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppButton, BrandMark, BrandWordmark, ScreenContainer } from "@/src/ui/components";
import { tokens } from "@/src/ui/tokens";

export default function WelcomeScreen() {
  const { t } = useTranslation();
  return (
    <ScreenContainer contentStyle={styles.container}>
      <View style={styles.brand}><BrandMark width={64} /><BrandWordmark width={196} /><Text style={styles.kicker}>{t("onboarding.splashKicker")}</Text></View>
      <Link asChild href="/(onboarding)/how-it-works"><AppButton label={t("actions.continue")} /></Link>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: "space-between", paddingBottom: tokens.spacing.xl },
  brand: { alignItems: "center", flex: 1, justifyContent: "center" },
  kicker: { fontFamily: "CrimsonText_600SemiBold", fontSize: 33, lineHeight: 46.2, letterSpacing: -0.2, color: tokens.colors.terracottaText, marginTop: tokens.spacing.xxl }
});
