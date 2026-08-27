import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { resolveSeedImage } from "@/src/presentation/content/seedImages";
import { useAnalyticsEvent } from "@/src/presentation/analytics/useAnalyticsEvent";
import { calculateGardenCardWidth } from "@/src/presentation/harvest/galleryLayout";
import { useHarvestGallery } from "@/src/presentation/harvest/useHarvests";
import { BackHeader, FeedbackState, ScreenContainer } from "@/src/ui/components";
import { tokens } from "@/src/ui/tokens";
export default function PrivateGardenScreen() {
  const router = useRouter(); const resource = useHarvestGallery();
  const [gridWidth, setGridWidth] = useState(0);
  const cardWidth = calculateGardenCardWidth(gridWidth, tokens.spacing.cardGap);
  useAnalyticsEvent("garden_opened");
  return <ScreenContainer scroll contentStyle={styles.container}><BackHeader rightAccessory={<Ionicons color={tokens.colors.olive} name="lock-closed-outline" size={tokens.layout.icon.md} />} /><View style={styles.intro}><Text style={styles.eyebrow}>PRIVATE TO YOU</Text><Text accessibilityRole="header" style={styles.title}>Your Garden</Text><Text style={styles.body}>A quiet record of what you have grown and harvested.</Text></View>
    {resource.loading ? <FeedbackState kind="loading" title="Opening your garden" description="Gathering your harvest history." /> : null}{resource.error ? <FeedbackState kind="error" title="Your garden is unavailable" description={resource.error.message} actionLabel="Try again" onAction={() => void resource.reload()} /> : null}{!resource.loading && !resource.error && resource.data.length === 0 ? <FeedbackState kind="empty" title="Your first harvest will live here" description="Complete a grow cycle to begin your private archive." /> : null}
    <View onLayout={(event) => setGridWidth(event.nativeEvent.layout.width)} style={styles.grid}>{resource.data.map((item) => { const source = item.photoUrl ? { uri: item.photoUrl } : resolveSeedImage(item.seed.images); return <Pressable accessibilityRole="button" key={item.record.id} onPress={() => router.push(`/harvest/${item.record.id}`)} style={[styles.card, cardWidth > 0 ? { width: cardWidth } : styles.cardFallback]}>{source ? <View style={styles.media}><Image accessibilityLabel={`${item.seed.commonName} harvest`} resizeMode="cover" source={source} style={styles.image} /></View> : null}<View style={styles.copy}><Text style={styles.name}>{item.seed.commonName}</Text><Text style={styles.meta}>{formatDate(item.record.harvestedAt)} · Harvest {item.record.harvestNumber}</Text>{!item.photoUrl ? <Text style={styles.authored}>Seed photo</Text> : null}</View></Pressable>; })}</View></ScreenContainer>;
}
function formatDate(value: string) { return new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" }).format(new Date(value)); }
const styles = StyleSheet.create({ container: { gap: tokens.spacing.sectionGap, paddingBottom: tokens.spacing.xl }, intro: { gap: tokens.spacing.sm, marginHorizontal: tokens.spacing.md }, eyebrow: { ...tokens.typography.label, color: tokens.colors.oliveLabel }, title: { ...tokens.typography.displayLarge, color: tokens.colors.terracottaText }, body: { ...tokens.typography.body, color: tokens.colors.ink82 }, grid: { alignItems: "flex-start", flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing.cardGap }, card: { alignSelf: "flex-start", backgroundColor: tokens.colors.card, borderRadius: tokens.radii.card, flexGrow: 0, overflow: "hidden", ...tokens.elevation.raisedMd }, cardFallback: { width: "48%" }, media: { aspectRatio: 1, overflow: "hidden", position: "relative", width: "100%" }, image: { ...StyleSheet.absoluteFillObject, height: undefined, width: undefined }, copy: { gap: tokens.spacing.xxs, padding: tokens.spacing.sm }, name: { ...tokens.typography.cardTitle, color: tokens.colors.forest }, meta: { ...tokens.typography.caption, color: tokens.colors.ink82 }, authored: { ...tokens.typography.caption, color: tokens.colors.oliveLabel, textTransform: "uppercase" } });
