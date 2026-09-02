import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppButton, AppCard, BackHeader, PhotoFrame, ScreenContainer, StageBadge } from "@/src/ui/components";
import { resolveSeedAccess } from "@/src/application/content/access";
import { resolveSeedImage } from "@/src/presentation/content/seedImages";
import { usePublishedSeed } from "@/src/presentation/content/useSeedContent";
import { useStartCycle } from "@/src/presentation/cycles/useCycleData";
import { tokens } from "@/src/ui/tokens";

export default function SeedDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug?: string }>();
  const query = usePublishedSeed(slug ?? "");
  const starter = useStartCycle();
  if (query.loading) return <ScreenContainer contentStyle={styles.feedback}><Text accessibilityLiveRegion="polite" style={styles.description}>{t("content.loadingDetail")}</Text></ScreenContainer>;
  if (query.error) return <ScreenContainer contentStyle={styles.feedback}><Text accessibilityLiveRegion="polite" style={styles.error}>{t("content.error")}</Text><AppButton label={t("content.tryAgain")} onPress={query.retry} /></ScreenContainer>;
  if (!query.data) return <ScreenContainer contentStyle={styles.feedback}><Text accessibilityLiveRegion="polite" style={styles.description}>{t("content.notFound")}</Text><AppButton label={t("stageTwo.backToExplore")} onPress={() => router.back()} /></ScreenContainer>;
  const seed = query.data;
  const access = resolveSeedAccess(seed.accessType);
  const image = resolveSeedImage(seed.images);
  function handlePrimaryAction() {
    if (access.state === "locked") { router.push("/paywall"); return; }
    if (!access.canStart) return;
    void starter.start(seed.slug).then((cycleId) => router.replace(`/cycle/${cycleId}`)).catch(() => undefined);
  }
  return (
    <ScreenContainer scroll contentStyle={styles.container}>
      <BackHeader backLabel={t("stageTwo.backToExplore")} />
      <View style={styles.headerTitle}><Text style={styles.eyebrow}>{t("stageTwo.seedPreviewEyebrow")}</Text><Text accessibilityRole="header" style={styles.title}>{seed.commonName}</Text><Text style={styles.botanical}>{seed.botanicalName}</Text></View>
      {image ? <View><PhotoFrame accessibilityLabel={seed.commonName} source={image} style={styles.photo} /><View style={styles.badge}><StageBadge label={access.state === "available" ? t("stageTwo.free") : access.state === "locked" ? t("main.premium") : t("stageTwo.comingSoon")} tone={access.state === "locked" ? "premium" : "success"} /></View></View> : null}
      <Text style={[styles.description, styles.textInset]}>{seed.description}</Text>
      <View style={styles.meta}><Meta label={t("stageTwo.seedPreviewDuration")} value={formatDuration(seed.durationDaysMin, seed.durationDaysMax)} /><Meta label={t("stageTwo.seedPreviewDifficulty")} value={seed.difficulty} /><Meta label={t("onboarding.environment")} value={seed.environmentSummary} /></View>
      <AppCard style={styles.panel}><Text style={styles.panelLabel}>{t("seedDetail.expect")}</Text><Text style={styles.panelTitle}>{seed.expectedResult}</Text><Text style={styles.panelBody}>{seed.harvestReadiness}</Text></AppCard>
      {seed.accessType !== "coming_soon" ? <AppCard style={styles.panel}><Text style={styles.panelLabel}>{t("content.materials")}</Text><Text style={styles.panelBody}>{seed.materials.join(" · ")}</Text></AppCard> : null}
      {starter.error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{starter.error.message}</Text> : null}
      <AppButton disabled={access.state === "comingSoon"} loading={starter.loading} label={access.state === "available" ? t("onboarding.startCycle") : access.state === "locked" ? t("content.viewPremium") : t("stageTwo.comingSoon")} onPress={handlePrimaryAction} />
    </ScreenContainer>
  );
}

function Meta({ label, value }: { label: string; value: string }) { return <AppCard variant="muted" style={styles.metaItem}><Text style={styles.metaLabel}>{label}</Text><Text style={styles.metaValue}>{value}</Text></AppCard>; }
const styles = StyleSheet.create({ container: { gap: tokens.spacing.lg, paddingBottom: tokens.spacing.xxl }, feedback: { flex: 1, gap: tokens.spacing.lg, justifyContent: "center" }, error: { ...tokens.typography.body, color: tokens.colors.alert, textAlign: "center" }, headerTitle: { alignItems: "flex-start", gap: tokens.spacing.xxs, marginHorizontal: tokens.spacing.xxs }, eyebrow: { ...tokens.typography.label, color: tokens.colors.oliveLabel, textTransform: "uppercase" }, title: { ...tokens.typography.displayLarge, color: tokens.colors.terracottaText }, botanical: { ...tokens.typography.caption, color: tokens.colors.ink64, fontStyle: "italic" }, textInset: { marginHorizontal: tokens.spacing.xxs }, photo: { aspectRatio: 16 / 10, height: undefined }, badge: { bottom: tokens.spacing.md, position: "absolute", right: tokens.spacing.md }, description: { ...tokens.typography.body, color: tokens.colors.ink82, textAlign: "left" }, meta: { flexDirection: "row", gap: tokens.spacing.xs }, metaItem: { flex: 1, gap: tokens.spacing.xxs, minHeight: 92, paddingHorizontal: tokens.spacing.xs, paddingVertical: tokens.spacing.sm }, metaLabel: { fontFamily: "Inter_700Bold", fontSize: 9.5, lineHeight: 12, letterSpacing: 0.45, color: tokens.colors.oliveLabel, textTransform: "uppercase" }, metaValue: { ...tokens.typography.dataValue, color: tokens.colors.forest }, panel: { gap: tokens.spacing.xs }, panelLabel: { ...tokens.typography.label, color: tokens.colors.oliveLabel, textTransform: "uppercase" }, panelTitle: { ...tokens.typography.panelHeadline, color: tokens.colors.forest }, panelBody: { ...tokens.typography.body, color: tokens.colors.ink82 } });

function formatDuration(minimum: number, maximum: number): string { return minimum === maximum ? `${maximum} days` : `${minimum} to ${maximum} days`; }
