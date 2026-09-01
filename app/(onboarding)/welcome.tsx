import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppButton, BrandMark, BrandWordmark, ScreenContainer } from "@/src/ui/components";
import { tokens } from "@/src/ui/tokens";

export default function WelcomeScreen() {
  const { t } = useTranslation();
  return (
    <ScreenContainer contentStyle={styles.container}>
      <View style={styles.brand}><View style={styles.lockup}><BrandMark width={92} /><BrandWordmark width={154} /></View><Text style={styles.kicker}>{t("onboarding.splashKicker")}</Text><Text style={styles.body}>{t("onboarding.splashBody")}</Text></View>
      <Link asChild href="/(onboarding)/how-it-works"><AppButton label={t("actions.continue")} /></Link>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: "space-between", paddingBottom: tokens.spacing.xl },
  brand: { alignItems: "center", flex: 1, justifyContent: "center" },
  lockup: { alignItems: "center", gap: tokens.spacing.sm },
  kicker: { fontFamily: "CrimsonText_400Regular_Italic", fontSize: 28, lineHeight: 39.2, letterSpacing: -0.2, color: tokens.colors.olive, marginTop: tokens.spacing.xl },
  body: { ...tokens.typography.body, color: tokens.colors.textSecondary, marginTop: tokens.spacing.md, maxWidth: 300, textAlign: "center" }
});
