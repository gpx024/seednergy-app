import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppButton, AppCard, BrandHeader, CycleProgress, PhotoFrame, ScreenContainer, StageBadge } from "@/src/ui/components";
import { tokens } from "@/src/ui/tokens";

const cress = require("../../../assets/images/temporary/cress.png");

export default function CycleDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <ScreenContainer scroll contentStyle={styles.container}>
      <BrandHeader />
      <View style={styles.header}><Pressable accessibilityLabel="Back" accessibilityRole="button" hitSlop={12} onPress={() => router.back()} style={styles.headerButton}><Ionicons color={tokens.colors.ink} name="arrow-back" size={tokens.layout.icon.lg} /></Pressable><Pressable accessibilityLabel="More options" accessibilityRole="button" style={styles.headerButton}><Ionicons color={tokens.colors.ink} name="ellipsis-horizontal" size={tokens.layout.icon.lg} /></Pressable></View>
      <View style={styles.headerTitle}><Text style={styles.seed}>{t("stageTwo.cress")}</Text><Text style={styles.stage}>{t("main.growthDay")}</Text></View>
      <CycleProgress accessibilityLabel={t("main.progressLabel")} activeStep={1} labels={[t("main.setup"), t("main.growth"), t("main.harvest")]} />
      <View><PhotoFrame accessibilityLabel={t("onboarding.cressPhoto")} source={cress} style={styles.photo} /><View style={styles.badge}><StageBadge label={t("main.onTrack")} /></View></View>
      <AppCard variant="nested" style={styles.guide}><Text style={styles.guideLabel}>{t("cycle.guidedAction")}</Text><Text style={styles.guideTitle}>{t("cycle.waterLightly")}</Text><Text style={styles.guideBody}>{t("cycle.waterBody")}</Text></AppCard>
      <AppCard style={styles.observation}><Text style={styles.observationLabel}>{t("cycle.observation")}</Text><Text style={styles.observationBody}>{t("cycle.observationBody")}</Text></AppCard>
      <AppButton disabled label={t("cycle.checkGrowth")} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ container: { gap: tokens.spacing.lg, paddingBottom: tokens.spacing.xxl }, header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }, headerButton: { alignItems: "center", justifyContent: "center", height: tokens.layout.size.touchTarget, width: tokens.layout.size.touchTarget }, headerTitle: { alignItems: "center", gap: tokens.spacing.xxs }, seed: { ...tokens.typography.displayLarge, color: tokens.colors.terracottaText }, stage: { ...tokens.typography.label, color: tokens.colors.oliveLabel, textTransform: "uppercase" }, photo: { aspectRatio: 16 / 10, height: undefined }, badge: { bottom: tokens.spacing.md, position: "absolute", right: tokens.spacing.md }, guide: { gap: tokens.spacing.xs }, guideLabel: { ...tokens.typography.title, color: tokens.colors.stone }, guideTitle: { ...tokens.typography.cardTitle, color: tokens.colors.stone }, guideBody: { ...tokens.typography.body, color: tokens.colors.stone }, observation: { gap: tokens.spacing.sm }, observationLabel: { ...tokens.typography.title, color: tokens.colors.forest }, observationBody: { fontFamily: "CrimsonText_400Regular_Italic", fontSize: 18, lineHeight: 24, color: tokens.colors.ink82 } });
