import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useAnalyticsEvent } from "@/src/presentation/analytics/useAnalyticsEvent";
import { resolveSeedImage } from "@/src/presentation/content/seedImages";
import { calculateGardenCardWidth } from "@/src/presentation/harvest/galleryLayout";
import { useHarvestGallery } from "@/src/presentation/harvest/useHarvests";
import { AppCard, FeedbackState, ScreenContainer, SectionHeader } from "@/src/ui/components";
import { tokens } from "@/src/ui/tokens";

type GardenView = "private" | "public";

export default function GardenScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const resource = useHarvestGallery();
  const [view, setView] = useState<GardenView>("private");
  const [gridWidth, setGridWidth] = useState(0);
  const cardWidth = calculateGardenCardWidth(gridWidth, tokens.spacing.cardGap);
  const reload = resource.reload;

  useAnalyticsEvent("garden_opened");
  useFocusEffect(useCallback(() => { void reload(); }, [reload]));

  return (
    <ScreenContainer includeBottomSafeArea={false} scroll contentStyle={styles.container}>
      <SectionHeader title={t("garden.title")} />
      <Text style={styles.body}>{t("garden.body")}</Text>

      <View accessibilityRole="tablist" style={styles.filters}>
        {(["private", "public"] as const).map((item) => {
          const active = view === item;
          return <Pressable accessibilityRole="tab" accessibilityState={{ selected: active }} key={item} onPress={() => setView(item)} style={[styles.filterSurface, active && styles.filterActiveSurface]}><Ionicons color={active ? tokens.colors.raised : tokens.colors.olive} name={item === "private" ? "lock-closed-outline" : "people-outline"} size={18} /><Text style={[styles.filterText, active && styles.filterActiveText]}>{t(`garden.${item}`)}</Text></Pressable>;
        })}
      </View>

      {view === "private" ? <>
        {resource.loading ? <FeedbackState kind="loading" title={t("garden.loading")} description={t("garden.loadingBody")} /> : null}
        {resource.error ? <FeedbackState actionLabel={t("content.tryAgain")} description={resource.error.message} kind="error" onAction={() => void resource.reload()} title={t("garden.error")} /> : null}
        {!resource.loading && !resource.error && resource.data.length === 0 ? <FeedbackState description={t("garden.emptyBody")} kind="empty" title={t("garden.empty")} /> : null}
        <View onLayout={(event) => setGridWidth(event.nativeEvent.layout.width)} style={styles.grid}>
          {resource.data.map((item) => {
            const source = item.photoUrl ? { uri: item.photoUrl } : resolveSeedImage(item.seed.images);
            return <Pressable accessibilityRole="button" key={item.record.id} onPress={() => router.push(`/harvest/${item.record.id}`)} style={[styles.card, cardWidth > 0 ? { width: cardWidth } : styles.cardFallback]}>{source ? <View style={styles.media}><Image accessibilityLabel={t("garden.harvestPhoto", { seed: item.seed.commonName })} resizeMode="cover" source={source} style={styles.image} /></View> : null}<View style={styles.cardCopy}><Text style={styles.name}>{item.seed.commonName}</Text><Text style={styles.meta}>{formatDate(item.record.harvestedAt)} · {t("garden.harvestNumber", { number: item.record.harvestNumber })}</Text>{!item.photoUrl ? <Text style={styles.authored}>{t("garden.seedPhoto")}</Text> : null}</View></Pressable>;
          })}
        </View>
      </> : <AppCard style={styles.comingSoon} variant="hero"><View style={styles.comingSoonIcon}><Ionicons color={tokens.colors.accent} name="people-outline" size={tokens.layout.icon.xl} /></View><Text style={styles.comingSoonEyebrow}>{t("garden.comingSoon")}</Text><Text style={styles.comingSoonTitle}>{t("garden.publicTitle")}</Text><Text style={styles.comingSoonBody}>{t("garden.publicBody")}</Text><View style={styles.boundary}><Ionicons color={tokens.colors.olive} name="shield-checkmark-outline" size={tokens.layout.icon.sm} /><Text style={styles.boundaryText}>{t("garden.publicBoundary")}</Text></View></AppCard>}
    </ScreenContainer>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

const styles = StyleSheet.create({
  container: { gap: tokens.spacing.md, paddingBottom: tokens.spacing.xs },
  body: { ...tokens.typography.body, color: tokens.colors.textStrong, marginHorizontal: tokens.spacing.xxs },
  filters: { alignItems: "center", flexDirection: "row", gap: tokens.spacing.md },
  filterSurface: { alignItems: "center", flex: 1, flexDirection: "row", gap: tokens.spacing.xs, justifyContent: "center", minHeight: tokens.layout.size.touchTarget },
  filterActiveSurface: { backgroundColor: tokens.colors.olive, borderRadius: tokens.radii.pill, ...tokens.elevation.pillOlive },
  filterText: { fontFamily: "Inter_600SemiBold", fontSize: 13, lineHeight: 17, color: tokens.colors.olive },
  filterActiveText: { color: tokens.colors.raised },
  grid: { alignItems: "flex-start", flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing.cardGap },
  card: { alignSelf: "flex-start", backgroundColor: tokens.colors.card, borderRadius: tokens.radii.card, flexGrow: 0, overflow: "hidden", ...tokens.elevation.raisedMd },
  cardFallback: { width: "48%" },
  media: { aspectRatio: 1, overflow: "hidden", position: "relative", width: "100%" },
  image: { ...StyleSheet.absoluteFillObject, height: undefined, width: undefined },
  cardCopy: { gap: tokens.spacing.xxs, minHeight: 82, padding: tokens.spacing.sm, paddingBottom: tokens.spacing.md },
  name: { ...tokens.typography.cardTitle, color: tokens.colors.seed },
  meta: { ...tokens.typography.caption, color: tokens.colors.textSecondary },
  authored: { ...tokens.typography.caption, color: tokens.colors.olive, textTransform: "uppercase" },
  comingSoon: { alignItems: "center", gap: tokens.spacing.sm, paddingHorizontal: tokens.spacing.xl, paddingVertical: tokens.spacing.xxl },
  comingSoonIcon: { alignItems: "center", backgroundColor: tokens.colors.raised, borderRadius: tokens.radii.pill, height: 92, justifyContent: "center", width: 92, ...tokens.elevation.raisedLg },
  comingSoonEyebrow: { ...tokens.typography.label, color: tokens.colors.accent, textTransform: "uppercase" },
  comingSoonTitle: { ...tokens.typography.displayMedium, color: tokens.colors.brand, textAlign: "center" },
  comingSoonBody: { ...tokens.typography.body, color: tokens.colors.textSecondary, maxWidth: 310, textAlign: "center" },
  boundary: { alignItems: "center", flexDirection: "row", gap: tokens.spacing.xs, marginTop: tokens.spacing.sm },
  boundaryText: { ...tokens.typography.caption, color: tokens.colors.olive, flexShrink: 1 }
});
