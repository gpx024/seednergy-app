import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppButton, AppCard, BrandHeader, CycleGauge, CycleProgress, PhotoFrame, ScreenContainer, StageBadge } from "@/src/ui/components";
import { tokens } from "@/src/ui/tokens";

const cress = require("../../assets/images/temporary/cress.png");

export default function HomeScreen() {
  const { t } = useTranslation();
  return (
    <ScreenContainer includeBottomSafeArea={false} scroll contentStyle={styles.container}>
      <View style={styles.intro}><BrandHeader /><Text accessibilityRole="header" maxFontSizeMultiplier={1.6} style={styles.greeting}>{t("main.greetingName")}</Text></View>
      <AppCard variant="hero" style={styles.hero}>
        <View style={styles.cycleSummary}><CycleGauge accessibilityLabel={t("main.progressLabel")} day={3} progress={0.42} totalDays={7} /><View style={styles.cycleIdentity}><Text maxFontSizeMultiplier={1.6} style={styles.seedName}>{t("stageTwo.cress")}</Text><Text style={styles.stageLabel}>{t("main.growthStage")}</Text></View><StageBadge label={t("main.onTrack")} /></View>
        <PhotoFrame accessibilityLabel={t("onboarding.cressPhoto")} source={cress} style={styles.photo} />
        <CycleProgress accessibilityLabel={t("main.progressLabel")} activeStep={1} labels={[t("main.setup"), t("main.growth"), t("main.harvest")]} />
        <AppCard variant="nested" style={styles.coach}><Text style={styles.coachLabel}>{t("main.guideLabel")}</Text><Text style={styles.coachTitle}>{t("main.nextAction")}</Text><Text style={styles.coachBody}>{t("main.coachBody")}</Text></AppCard>
        <Link asChild href="/cycle/preview"><AppButton label={t("main.openCycle")} /></Link>
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { gap: tokens.spacing.md, paddingBottom: tokens.spacing.xs },
  intro: { gap: 0 },
  greeting: { ...tokens.typography.display, color: tokens.colors.terracotta },
  hero: { gap: tokens.spacing.md },
  cycleSummary: { alignItems: "center", flexDirection: "row", gap: tokens.spacing.sm },
  cycleIdentity: { flex: 1, gap: tokens.spacing.xxs },
  seedName: { ...tokens.typography.name, color: tokens.colors.forest },
  stageLabel: { ...tokens.typography.label, color: tokens.colors.oliveLabel, textTransform: "uppercase" },
  photo: { height: 190, width: "100%" },
  coach: { gap: tokens.spacing.xs },
  coachLabel: { ...tokens.typography.label, color: tokens.colors.stone, textTransform: "uppercase" },
  coachTitle: { ...tokens.typography.cardTitle, color: tokens.colors.stone },
  coachBody: { ...tokens.typography.body, color: tokens.colors.stone }
});
