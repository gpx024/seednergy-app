import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppField, BrandHeader, ScreenContainer, SeedCard } from "@/src/ui/components";
import { resolveSeedAccess } from "@/src/application/content/access";
import { resolveSeedImage } from "@/src/presentation/content/seedImages";
import { useSeedLibrary } from "@/src/presentation/content/useSeedContent";
import { tokens } from "@/src/ui/tokens";

export default function ExploreScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const library = useSeedLibrary(query);
  return (
    <ScreenContainer includeBottomSafeArea={false} scroll contentStyle={styles.container}>
      <BrandHeader />
      <View style={styles.heading}><Text accessibilityRole="header" style={styles.title}>{t("main.exploreSeeds")}</Text><Text style={styles.body}>{t("main.exploreBody")}</Text></View>
      <AppField accessibilityLabel={t("main.searchSeeds")} label={t("main.searchSeeds")} onChangeText={setQuery} placeholder={t("main.searchPlaceholder")} value={query} />
      {library.loading ? <Text accessibilityLiveRegion="polite" style={styles.message}>{t("content.loading")}</Text> : null}
      {library.error ? <Text accessibilityLiveRegion="polite" onPress={library.retry} style={styles.error}>{t("content.error")}</Text> : null}
      {!library.loading && !library.error && library.data.length === 0 ? <Text accessibilityLiveRegion="polite" style={styles.message}>{t("content.empty")}</Text> : null}
      <View style={styles.grid}>{library.data.map((seed) => {
        const access = resolveSeedAccess(seed.accessType);
        return <SeedCard key={seed.id} access={access.state === "available" ? "free" : access.state} accessLabel={access.state === "available" ? t("stageTwo.free") : access.state === "locked" ? t("main.premium") : t("stageTwo.comingSoon")} difficulty={seed.difficulty} duration={formatDuration(seed.durationDaysMin, seed.durationDaysMax)} imageSource={resolveSeedImage(seed.images)} name={seed.commonName} onPress={() => router.push({ pathname: "/seeds/[slug]", params: { slug: seed.slug } })} />;
      })}</View>
      <View style={styles.note}><Ionicons color={tokens.colors.oliveLabel} name="information-circle-outline" size={tokens.layout.icon.md} /><Text style={styles.noteText}>{t("main.catalogueNote")}</Text></View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { gap: tokens.spacing.sectionGap, paddingBottom: tokens.spacing.xs },
  heading: { gap: tokens.spacing.xs, marginHorizontal: tokens.spacing.md },
  label: { ...tokens.typography.label, color: tokens.colors.oliveLabel, textTransform: "uppercase" },
  title: { ...tokens.typography.displayLarge, color: tokens.colors.terracottaText },
  body: { ...tokens.typography.body, color: tokens.colors.ink82 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing.cardGap },
  note: { alignItems: "center", flexDirection: "row", gap: tokens.spacing.xs },
  noteText: { ...tokens.typography.caption, color: tokens.colors.ink64, flex: 1 }
  ,message: { ...tokens.typography.body, color: tokens.colors.ink64, marginHorizontal: tokens.spacing.md, textAlign: "center" }
  ,error: { ...tokens.typography.body, color: tokens.colors.alert, marginHorizontal: tokens.spacing.md, textAlign: "center" }
});

function formatDuration(minimum: number, maximum: number): string {
  return minimum === maximum ? `${maximum} days` : `${minimum} to ${maximum} days`;
}
