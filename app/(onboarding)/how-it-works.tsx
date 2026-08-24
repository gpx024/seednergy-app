import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppButton, BrandWordmark, PhotoFrame, ScreenContainer } from "@/src/ui/components";
import { tokens } from "@/src/ui/tokens";

const cress = require("../../assets/images/temporary/cress.png");

export default function HowItWorksScreen() {
  const { t } = useTranslation();
  return (
    <ScreenContainer contentStyle={styles.container}>
      <View style={styles.wordmark}><BrandWordmark width={132} /></View>
      <PhotoFrame accessibilityLabel={t("onboarding.cressPhoto")} shape="capsule" source={cress} style={styles.photo} />
      <View style={styles.copy}><Text accessibilityRole="header" maxFontSizeMultiplier={1.7} style={styles.title}>{t("onboarding.valueTitle")}</Text><Text maxFontSizeMultiplier={2} style={styles.body}>{t("onboarding.valueBody")}</Text></View>
      <View style={styles.actions}><Link asChild href="/(onboarding)/create-account"><AppButton label={t("onboarding.startGrowing")} /></Link><Link asChild href="/(onboarding)/create-account"><AppButton label={t("onboarding.logIn")} variant="oliveText" /></Link></View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { gap: tokens.spacing.lg, paddingBottom: tokens.spacing.xl },
  wordmark: { alignItems: "center" },
  photo: { alignSelf: "center", flex: 1, minHeight: 270, width: "58%" },
  copy: { gap: tokens.spacing.sm, marginHorizontal: tokens.spacing.md },
  title: { ...tokens.typography.displayLarge, color: tokens.colors.terracottaText },
  body: { ...tokens.typography.body, color: tokens.colors.ink82 },
  actions: { gap: tokens.spacing.xs }
});
