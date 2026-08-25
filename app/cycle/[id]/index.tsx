import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppButton, AppCard, CycleGauge, CycleProgress, FeedbackState, PhotoFrame, ScreenContainer, StageBadge } from "@/src/ui/components";
import { resolveSeedImage } from "@/src/presentation/content/seedImages";
import { useCycle } from "@/src/presentation/cycles/useCycleData";
import { tokens } from "@/src/ui/tokens";

export default function CycleDetailScreen() {
  const { t } = useTranslation(); const router = useRouter(); const { id } = useLocalSearchParams<{ id?: string }>(); const resource = useCycle(id); const cycle = resource.data;
  if (resource.loading) return <ScreenContainer><FeedbackState kind="loading" title={t("cycle.loadingTitle")} description={t("cycle.loadingBody")} /></ScreenContainer>;
  if (resource.error) return <ScreenContainer><FeedbackState kind="error" title={t("cycle.errorTitle")} description={resource.error.message} actionLabel={t("content.tryAgain")} onAction={() => void resource.reload()} /></ScreenContainer>;
  if (!cycle) return <ScreenContainer><FeedbackState kind="empty" title={t("cycle.notFound")} description={t("cycle.notFoundBody")} actionLabel={t("cycle.backToCycles")} onAction={() => router.replace("/(tabs)/cycles")} /></ScreenContainer>;
  const image = resolveSeedImage(cycle.seed.images);
  return <ScreenContainer scroll contentStyle={styles.container}><View style={styles.header}><Pressable accessibilityLabel="Back" accessibilityRole="button" hitSlop={12} onPress={() => router.back()} style={styles.headerButton}><Ionicons color={tokens.colors.ink} name="arrow-back" size={tokens.layout.icon.lg} /></Pressable><Pressable accessibilityLabel="Archive cycle" accessibilityRole="button" onPress={() => void resource.archive().then(() => router.replace("/(tabs)/cycles")).catch(() => undefined)} style={styles.headerButton}><Ionicons color={tokens.colors.ink} name="archive-outline" size={tokens.layout.icon.md} /></Pressable></View>
    <View style={styles.titleRow}><View style={styles.headerTitle}><Text style={styles.seed}>{cycle.seed.commonName}</Text><Text style={styles.stage}>{cycle.phase} · Day {cycle.day}</Text></View><CycleGauge accessibilityLabel={`Day ${cycle.day} of ${cycle.totalDays}`} day={cycle.day} progress={cycle.progress} totalDays={cycle.totalDays} /></View>
    {image ? <View><PhotoFrame accessibilityLabel={cycle.seed.commonName} source={image} style={styles.photo} /><View style={styles.badge}><StageBadge label={cycle.priority === "harvest_ready" ? t("cycle.harvestReady") : cycle.priority === "needs_check" ? t("main.needsCheck") : t("main.onTrack")} tone={cycle.priority === "needs_check" ? "attention" : "active"} /></View></View> : null}
    <View style={styles.textInset}><CycleProgress accessibilityLabel={`${cycle.phase} stage`} activeStep={cycle.phase === "setup" ? 0 : cycle.phase === "growth" ? 1 : 2} labels={[t("main.setup"), t("main.growth"), t("main.harvest")]} /></View>
    <AppCard style={styles.observation}><Text style={styles.observationLabel}>{t("cycle.observation")}</Text><Text style={styles.observationBody}>{cycle.observationPrompt}</Text></AppCard>
    <AppCard variant="nested" style={styles.guide}><Text style={styles.guideLabel}>{t("cycle.guidedAction")}</Text><Text style={styles.guideTitle}>{cycle.nextAction}</Text><Text style={styles.guideBody}>{cycle.guidance}</Text></AppCard>
    {cycle.cycle.status === "archived" ? <AppButton label={t("cycle.restart")} loading={resource.mutating} onPress={() => void resource.restart().then((nextId) => router.replace(`/cycle/${nextId}`)).catch(() => undefined)} /> : <AppButton label={t("cycle.markDone")} loading={resource.mutating} onPress={() => void resource.markActionDone().catch(() => undefined)} />}
  </ScreenContainer>;
}

const styles = StyleSheet.create({ container: { gap: tokens.spacing.cardGap, paddingBottom: tokens.spacing.md }, header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }, headerButton: { alignItems: "center", justifyContent: "center", height: tokens.layout.size.touchTarget, width: tokens.layout.size.touchTarget }, titleRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginHorizontal: tokens.spacing.md }, headerTitle: { alignItems: "flex-start", gap: 0 }, seed: { ...tokens.typography.displayLarge, color: tokens.colors.terracottaText }, stage: { ...tokens.typography.label, color: tokens.colors.oliveLabel, textTransform: "uppercase" }, textInset: { marginHorizontal: tokens.spacing.md }, photo: { aspectRatio: 16 / 10, height: undefined }, badge: { bottom: tokens.spacing.md, position: "absolute", right: tokens.spacing.md }, guide: { gap: tokens.spacing.xs }, guideLabel: { ...tokens.typography.cardTitle, color: tokens.colors.stone }, guideTitle: { ...tokens.typography.cardTitle, color: tokens.colors.stone }, guideBody: { ...tokens.typography.bodyStrong, color: tokens.colors.stone }, observation: { gap: tokens.spacing.sm }, observationLabel: { ...tokens.typography.cardTitle, color: tokens.colors.forest }, observationBody: { fontFamily: "CrimsonText_400Regular_Italic", fontSize: 18, lineHeight: 21.6, color: tokens.colors.ink82 } });
