import { Link } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppButton, AppCard, BrandMark, CycleGauge, CycleProgress, ScreenContainer, StageBadge } from "@/src/ui/components";
import { tokens } from "@/src/ui/tokens";

const cress = require("../../assets/images/temporary/cress.png");

export default function HomeScreen() {
  const { t } = useTranslation();
  return (
    <ScreenContainer scroll contentStyle={styles.container}>
      <View style={styles.header}><View><Text style={styles.greeting}>{t("main.goodMorning")}</Text><Text accessibilityRole="header" style={styles.title}>{t("main.growerName")}</Text></View><View style={styles.brand}><BrandMark width={24} /></View></View>
      <AppCard variant="hero" style={styles.hero}>
        <View style={styles.heroTop}><View><Text style={styles.seedName}>{t("stageTwo.cress")}</Text><Text style={styles.meta}>{t("main.growthDay")}</Text></View><StageBadge label={t("main.onTrack")} /></View>
        <View style={styles.photoWrap}><Image accessibilityLabel={t("onboarding.cressPhoto")} resizeMode="cover" source={cress} style={styles.photo} /><View style={styles.gauge}><CycleGauge accessibilityLabel={t("main.progressLabel")} day={3} progress={0.42} /></View></View>
        <CycleProgress accessibilityLabel={t("main.progressLabel")} activeStep={1} labels={[t("main.setup"), t("main.growth"), t("main.harvest")]} />
        <AppCard variant="nested" style={styles.coach}><Text style={styles.coachLabel}>{t("main.guideLabel")}</Text><Text style={styles.coachTitle}>{t("main.nextAction")}</Text><Text style={styles.coachBody}>{t("main.coachBody")}</Text></AppCard>
        <Link asChild href="/cycle/preview"><AppButton label={t("main.openCycle")} /></Link>
      </AppCard>
      <Text style={styles.previewNote}>{t("main.previewNote")}</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { gap: tokens.spacing.sectionGap, paddingBottom: tokens.spacing.xl },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  greeting: { ...tokens.typography.caption, color: tokens.colors.ink64 },
  title: { ...tokens.typography.display, color: tokens.colors.terracottaText },
  brand: { alignItems: "center", justifyContent: "center", height: 58, width: 58, borderRadius: tokens.radii.pill, backgroundColor: tokens.colors.card, ...tokens.elevation.raisedMd },
  hero: { gap: tokens.spacing.md },
  heroTop: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  seedName: { ...tokens.typography.name, color: tokens.colors.forest },
  meta: { ...tokens.typography.caption, color: tokens.colors.ink64 },
  photoWrap: { height: 230, position: "relative" },
  photo: { height: "100%", width: "100%", borderRadius: 20 },
  gauge: { position: "absolute", right: tokens.spacing.md, top: tokens.spacing.md, backgroundColor: tokens.colors.card, borderRadius: tokens.radii.pill, padding: tokens.spacing.xs, ...tokens.elevation.raisedMd },
  coach: { gap: tokens.spacing.xs },
  coachLabel: { ...tokens.typography.label, color: tokens.colors.canvas, textTransform: "uppercase" },
  coachTitle: { ...tokens.typography.panelHeadline, color: tokens.colors.canvas },
  coachBody: { ...tokens.typography.body, color: tokens.colors.canvas },
  previewNote: { ...tokens.typography.caption, color: tokens.colors.ink64, textAlign: "center" }
});
