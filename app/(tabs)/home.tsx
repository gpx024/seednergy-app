import { useCallback } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppButton, AppCard, BrandHeader, CycleGauge, CycleProgress, FeedbackState, PhotoFrame, ScreenContainer, StageBadge } from "@/src/ui/components";
import { resolveSeedImage } from "@/src/presentation/content/seedImages";
import { useCycleList } from "@/src/presentation/cycles/useCycleData";
import { tokens } from "@/src/ui/tokens";

const profileImage = require("../../assets/images/profiles/alba-temporary.png");

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const cycles = useCycleList(true);
  const reloadCycles = cycles.reload;
  useFocusEffect(useCallback(() => { void reloadCycles(); }, [reloadCycles]));
  const cycle = cycles.data[0];
  const cycleImage = cycle ? resolveSeedImage(cycle.seed.images) : undefined;
  return <ScreenContainer includeBottomSafeArea={false} scroll contentStyle={styles.container}>
    <View style={styles.intro}><BrandHeader locationLabel={t("main.locationWeather")} profileImage={profileImage} /></View>
    {cycles.loading ? <FeedbackState kind="loading" title={t("cycle.loadingTitle")} description={t("cycle.loadingBody")} /> : null}
    {cycles.error ? <FeedbackState actionLabel={t("content.tryAgain")} description={cycles.error.message} kind="error" onAction={() => void cycles.reload()} title={t("cycle.errorTitle")} /> : null}
    {!cycles.loading && !cycles.error && !cycle ? <FeedbackState actionLabel={t("cycle.chooseSeed")} description={t("stageTwo.cyclesEmptyDescription")} kind="empty" onAction={() => router.push("/(tabs)/explore")} title={t("stageTwo.cyclesEmptyTitle")} /> : null}
    {cycle ? <AppCard variant="hero" style={styles.hero}><View style={styles.cycleSummary}><CycleGauge accessibilityLabel={`${cycle.seed.commonName}, day ${cycle.day} of ${cycle.totalDays}`} day={cycle.day} progress={cycle.progress} totalDays={cycle.totalDays} /><View style={styles.cycleIdentity}><Text style={styles.seedName}>{cycle.seed.commonName}</Text><Text style={styles.stageLabel}>{cycle.phase} stage</Text></View><StageBadge label={statusLabel(cycle.priority)} tone={cycle.priority === "needs_check" ? "attention" : "active"} /></View>
      {cycleImage ? <PhotoFrame accessibilityLabel={cycle.seed.commonName} source={cycleImage} style={styles.photo} /> : null}<CycleProgress accessibilityLabel={`${cycle.phase} stage`} activeStep={phaseIndex(cycle.phase)} labels={[t("main.setup"), t("main.growth"), t("main.harvest")]} />
      <AppCard variant="nested" style={styles.coach}><Text style={styles.coachLabel}>{cycle.actionCompletedToday ? t("cycle.completedLabel") : t("main.guideLabel")}</Text><Text style={styles.coachTitle}>{cycle.actionCompletedToday ? t("cycle.completedTitle") : cycle.nextAction}</Text><Text style={styles.coachBody}>{cycle.actionCompletedToday ? t("cycle.completedBody") : cycle.guidance}</Text></AppCard><AppButton label={t("main.openCycle")} onPress={() => router.push(`/cycle/${cycle.cycle.id}`)} /></AppCard> : null}
    {cycles.data.length > 1 ? <Text style={styles.more}>{t("cycle.moreActive", { count: cycles.data.length - 1 })}</Text> : null}
  </ScreenContainer>;
}

function phaseIndex(phase: "setup" | "growth" | "harvest") { return phase === "setup" ? 0 : phase === "growth" ? 1 : 2; }
function statusLabel(priority: string) { return priority === "harvest_ready" ? "Harvest ready" : priority === "needs_check" || priority === "action_due" ? "Needs check" : priority === "harvest_soon" ? "Harvest soon" : "On track"; }
const styles = StyleSheet.create({
  container: { gap: tokens.spacing.lg, paddingBottom: tokens.spacing.xs },
  intro: { marginHorizontal: tokens.spacing.lg },
  hero: { gap: tokens.spacing.cardGap },
  cycleSummary: { alignItems: "center", flexDirection: "row", gap: tokens.spacing.sm },
  cycleIdentity: { flex: 1, gap: 0 },
  seedName: { fontFamily: "CrimsonText_600SemiBold", fontSize: 30, lineHeight: 34, color: tokens.colors.seed },
  stageLabel: { ...tokens.typography.label, color: tokens.colors.accent, textTransform: "uppercase" },
  photo: { height: 190, width: "100%" },
  coach: { gap: tokens.spacing.xs },
  coachLabel: { fontFamily: "CrimsonText_600SemiBold", fontSize: 16, lineHeight: 20, color: tokens.colors.coachLabel },
  coachTitle: { ...tokens.typography.bodyStrong, fontSize: 16, lineHeight: 21, color: tokens.colors.raised },
  coachBody: { ...tokens.typography.body, color: tokens.colors.raised },
  more: { ...tokens.typography.caption, color: tokens.colors.textMuted, textAlign: "center" }
});
