import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";

import { SeedCard, ScreenContainer } from "@/src/ui/components";
import { tokens } from "@/src/ui/tokens";

export default function ExploreScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <ScreenContainer scroll contentStyle={styles.container}>
      <View style={styles.intro}>
        <Text style={styles.eyebrow}>{t("stageTwo.exploreEyebrow")}</Text>
        <Text accessibilityRole="header" style={styles.title}>{t("stageTwo.exploreTitle")}</Text>
        <Text style={styles.description}>{t("stageTwo.exploreDescription")}</Text>
      </View>
      <View style={styles.cards}>
        <SeedCard access="free" accessLabel={t("stageTwo.free")} difficulty={t("stageTwo.easy")} duration={t("stageTwo.cressDuration")} name={t("stageTwo.cress")} onPress={() => router.push("/seeds/cress")} />
        <SeedCard access="comingSoon" accessLabel={t("stageTwo.comingSoon")} difficulty={t("stageTwo.easy")} duration={t("stageTwo.peaDuration")} name={t("stageTwo.peaShoots")} />
        <SeedCard access="comingSoon" accessLabel={t("stageTwo.comingSoon")} difficulty={t("stageTwo.easy")} duration={t("stageTwo.radishDuration")} name={t("stageTwo.radishMicrogreens")} />
        <SeedCard access="comingSoon" accessLabel={t("stageTwo.comingSoon")} difficulty={t("stageTwo.easy")} duration={t("stageTwo.broccoliDuration")} name={t("stageTwo.broccoliMicrogreens")} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { gap: tokens.spacing.xl, paddingBottom: tokens.spacing.xxxl },
  intro: { gap: tokens.spacing.sm },
  eyebrow: { ...tokens.typography.label, color: tokens.colors.textSubtle, textTransform: "uppercase" },
  title: { ...tokens.typography.display, color: tokens.colors.textPrimary },
  description: { ...tokens.typography.body, color: tokens.colors.textSecondary },
  cards: { gap: tokens.spacing.md }
});
