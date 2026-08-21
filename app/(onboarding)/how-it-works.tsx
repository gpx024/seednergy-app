import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppButton, PhotoFrame, ScreenContainer } from "@/src/ui/components";
import { tokens } from "@/src/ui/tokens";

const cress = require("../../assets/images/temporary/cress.png");

export default function HowItWorksScreen() {
  const { t } = useTranslation();
  return (
    <ScreenContainer contentStyle={styles.container}>
      <PhotoFrame accessibilityLabel={t("onboarding.cressPhoto")} source={cress} style={styles.photo} />
      <View style={styles.copy}><Text accessibilityRole="header" maxFontSizeMultiplier={1.7} style={styles.title}>{t("onboarding.valueTitle")}</Text><Text maxFontSizeMultiplier={2} style={styles.body}>{t("onboarding.valueBody")}</Text></View>
      <View style={styles.actions}><Link asChild href="/(onboarding)/create-account"><AppButton label={t("onboarding.startGrowing")} /></Link><Link asChild href="/(onboarding)/create-account"><AppButton label={t("onboarding.logIn")} variant="text" /></Link></View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { gap: tokens.spacing.xl, paddingBottom: tokens.spacing.xl },
  photo: { flex: 1, minHeight: 260 },
  copy: { gap: tokens.spacing.sm },
  title: { ...tokens.typography.display, color: tokens.colors.terracottaText },
  body: { ...tokens.typography.body, color: tokens.colors.ink82 },
  actions: { gap: tokens.spacing.xs }
});
