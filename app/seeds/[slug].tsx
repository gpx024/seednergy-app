import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppButton, AppCard, BrandHeader, PhotoFrame, ScreenContainer, StageBadge } from "@/src/ui/components";
import { tokens } from "@/src/ui/tokens";

const cress = require("../../assets/images/temporary/cress.png");

export default function SeedDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <ScreenContainer scroll contentStyle={styles.container}>
      <BrandHeader />
      <View style={styles.header}><Pressable accessibilityLabel={t("stageTwo.backToExplore")} accessibilityRole="button" hitSlop={12} onPress={() => router.back()} style={styles.headerButton}><Ionicons color={tokens.colors.ink} name="arrow-back" size={tokens.layout.icon.lg} /></Pressable><View style={styles.headerButton} /></View>
      <View style={styles.headerTitle}><Text style={styles.eyebrow}>{t("stageTwo.seedPreviewEyebrow")}</Text><Text accessibilityRole="header" style={styles.title}>{t("stageTwo.cress")}</Text></View>
      <View><PhotoFrame accessibilityLabel={t("onboarding.cressPhoto")} source={cress} style={styles.photo} /><View style={styles.badge}><StageBadge label={t("stageTwo.free")} tone="success" /></View></View>
      <Text style={[styles.description, styles.textInset]}>{t("stageTwo.seedPreviewDescription")}</Text>
      <View style={styles.meta}><Meta label={t("stageTwo.seedPreviewDuration")} value={t("onboarding.cressDuration")} /><Meta label={t("stageTwo.seedPreviewDifficulty")} value={t("stageTwo.easy")} /><Meta label={t("onboarding.environment")} value={t("onboarding.anySpace")} /></View>
      <AppCard style={styles.panel}><Text style={styles.panelLabel}>{t("seedDetail.expect")}</Text><Text style={styles.panelTitle}>{t("seedDetail.quickReward")}</Text><Text style={styles.panelBody}>{t("seedDetail.expectBody")}</Text></AppCard>
      <AppButton disabled label={t("onboarding.startCycle")} />
    </ScreenContainer>
  );
}

function Meta({ label, value }: { label: string; value: string }) { return <AppCard variant="muted" style={styles.metaItem}><Text style={styles.metaLabel}>{label}</Text><Text style={styles.metaValue}>{value}</Text></AppCard>; }
const styles = StyleSheet.create({ container: { gap: tokens.spacing.lg, paddingBottom: tokens.spacing.xxl }, header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }, headerButton: { alignItems: "center", justifyContent: "center", height: tokens.layout.size.touchTarget, width: tokens.layout.size.touchTarget }, headerTitle: { alignItems: "center", gap: tokens.spacing.xxs, marginHorizontal: tokens.spacing.md }, eyebrow: { ...tokens.typography.label, color: tokens.colors.oliveLabel, textTransform: "uppercase" }, title: { ...tokens.typography.displayLarge, color: tokens.colors.terracottaText }, textInset: { marginHorizontal: tokens.spacing.md }, photo: { aspectRatio: 16 / 10, height: undefined }, badge: { bottom: tokens.spacing.md, position: "absolute", right: tokens.spacing.md }, description: { ...tokens.typography.body, color: tokens.colors.ink82, textAlign: "center" }, meta: { flexDirection: "row", gap: tokens.spacing.cardGap }, metaItem: { flex: 1, gap: tokens.spacing.xs, minHeight: 104, padding: tokens.spacing.sm }, metaLabel: { ...tokens.typography.label, color: tokens.colors.oliveLabel, textTransform: "uppercase" }, metaValue: { ...tokens.typography.title, color: tokens.colors.forest }, panel: { gap: tokens.spacing.xs }, panelLabel: { ...tokens.typography.label, color: tokens.colors.oliveLabel, textTransform: "uppercase" }, panelTitle: { ...tokens.typography.panelHeadline, color: tokens.colors.forest }, panelBody: { ...tokens.typography.body, color: tokens.colors.ink82 } });
