import { useCallback, useMemo, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { CycleRow, FeedbackState, ScreenContainer, SectionHeader, SubmenuTab } from "@/src/ui/components";
import { resolveSeedImage } from "@/src/presentation/content/seedImages";
import { useCycleList } from "@/src/presentation/cycles/useCycleData";
import { tokens } from "@/src/ui/tokens";

type Filter = "active" | "completed" | "archived";
export default function CyclesScreen() {
  const { t } = useTranslation(); const router = useRouter(); const cycles = useCycleList(false); const [filter, setFilter] = useState<Filter>("active");
  const reloadCycles = cycles.reload;
  useFocusEffect(useCallback(() => { void reloadCycles(); }, [reloadCycles]));
  const shown = useMemo(() => cycles.data.filter((item) => filter === "active" ? ["active","harvest_ready"].includes(item.cycle.status) : filter === "completed" ? item.cycle.status === "harvested" : item.cycle.status === "archived"), [cycles.data, filter]);
  const harvestStage = shown.filter((item) => item.priority === "harvest_ready");
  const growthStage = shown.filter((item) => item.priority !== "harvest_ready");
  const renderCycle = (cycle: (typeof shown)[number]) => { const image = resolveSeedImage(cycle.seed.images); return image ? <CycleRow key={cycle.cycle.id} day={cycle.day} imageSource={image} meta={`Day ${cycle.day} · Next: ${cycle.nextAction}`} name={cycle.seed.commonName} onPress={() => router.push(`/cycle/${cycle.cycle.id}`)} progress={cycle.progress} status={cycle.priority === "needs_check" ? t("main.needsCheck") : cycle.priority === "harvest_ready" ? t("cycle.harvestReady") : t("main.onTrack")} statusTone={cycle.priority === "needs_check" ? "attention" : "active"} /> : null; };
  return <ScreenContainer includeBottomSafeArea={false} scroll contentStyle={styles.container}><SectionHeader title={t("main.myCycles")} />
    <View accessibilityRole="tablist" style={styles.filters}>{(["active","completed","archived"] as const).map((item) => <SubmenuTab key={item} label={`${t(`main.${item}`)}${item === "active" ? ` (${cycles.data.filter((cycle) => ["active","harvest_ready"].includes(cycle.cycle.status)).length})` : ""}`} onPress={() => setFilter(item)} selected={filter === item} />)}</View>
    {cycles.loading ? <FeedbackState kind="loading" title={t("cycle.loadingTitle")} description={t("cycle.loadingBody")} /> : null}{cycles.error ? <FeedbackState kind="error" title={t("cycle.errorTitle")} description={cycles.error.message} actionLabel={t("content.tryAgain")} onAction={() => void cycles.reload()} /> : null}
    {!cycles.loading && !cycles.error && shown.length === 0 ? <FeedbackState kind="empty" title={t("cycle.noCycles", { filter })} description={t("cycle.noCyclesBody")} /> : null}
    {harvestStage.length ? <View style={styles.section}><Text style={styles.label}>{t("main.harvestStage")}</Text>{harvestStage.map(renderCycle)}</View> : null}
    {growthStage.length ? <View style={styles.section}><Text style={styles.label}>{filter === "active" ? t("main.growthStage") : t(`main.${filter}`)}</Text>{growthStage.map(renderCycle)}</View> : null}
  </ScreenContainer>;
}
const styles = StyleSheet.create({ container: { gap: tokens.spacing.lg, paddingBottom: tokens.spacing.xs }, filters: { alignItems: "center", flexDirection: "row", gap: tokens.spacing.xs }, section: { gap: tokens.spacing.sm }, label: { ...tokens.typography.label, color: tokens.colors.accent, marginHorizontal: tokens.spacing.sm, textTransform: "uppercase" } });
