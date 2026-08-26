import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/src/presentation/auth/AuthProvider";
import { resolveSeedImage } from "@/src/presentation/content/seedImages";
import { useCycle } from "@/src/presentation/cycles/useCycleData";
import { useCompleteHarvest } from "@/src/presentation/harvest/useHarvests";
import type { CapturedPhoto } from "@/src/presentation/photoChecks/usePhotoChecks";
import { AppButton, AppCard, FeedbackState, PhotoFrame, ScreenContainer } from "@/src/ui/components";
import { tokens } from "@/src/ui/tokens";

export default function HarvestScreen() {
  const router = useRouter(); const { id } = useLocalSearchParams<{ id?: string }>(); const auth = useAuth(); const cycleResource = useCycle(id); const mutation = useCompleteHarvest();
  const [photo, setPhoto] = useState<CapturedPhoto | null>(null); const [selectionError, setSelectionError] = useState<string | null>(null); const cycle = cycleResource.data;
  async function choosePhoto() {
    setSelectionError(null); const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) throw new Error("Photo access is needed to add a private harvest photo.");
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8 }); const asset = result.assets?.[0];
    if (!result.canceled && asset) setPhoto({ uri: asset.uri, fileName: asset.fileName ?? `harvest-${Date.now()}.jpg`, contentType: normalizeContentType(asset.mimeType), fileSize: asset.fileSize ?? null });
  }
  async function finish() { if (!cycle || !auth.user) return; const harvest = await mutation.complete({ userId: auth.user.id, cycleId: cycle.cycle.id, photo }); router.replace(`/harvest/${harvest.id}`); }
  if (cycleResource.loading) return <ScreenContainer><FeedbackState kind="loading" title="Preparing your harvest" description="Loading the guidance for this grow." /></ScreenContainer>;
  if (cycleResource.error) return <ScreenContainer><FeedbackState kind="error" title="Harvest guidance is unavailable" description={cycleResource.error.message} actionLabel="Try again" onAction={() => void cycleResource.reload()} /></ScreenContainer>;
  if (!cycle) return <ScreenContainer><FeedbackState kind="empty" title="Cycle not found" description="Return to your cycles and choose a harvest-ready grow." /></ScreenContainer>;
  const seedImage = resolveSeedImage(cycle.seed.images);
  return <ScreenContainer scroll contentStyle={styles.container}>
    <View style={styles.header}><Pressable accessibilityLabel="Back" accessibilityRole="button" hitSlop={12} onPress={() => router.back()} style={styles.headerButton}><Ionicons color={tokens.colors.ink} name="arrow-back" size={tokens.layout.icon.lg} /></Pressable><Text style={styles.eyebrow}>HARVEST READY</Text></View>
    <View style={styles.intro}><Text accessibilityRole="header" style={styles.title}>Harvest your {cycle.seed.commonName}</Text><Text style={styles.body}>{cycle.seed.harvestReadiness}</Text></View>
    {seedImage ? <PhotoFrame accessibilityLabel={`Harvest-ready ${cycle.seed.commonName}`} source={seedImage} style={styles.hero} /> : null}
    <AppCard variant="nested" style={styles.instruction}><Text style={styles.cardLabel}>HOW TO HARVEST</Text><Text style={styles.cardTitle}>{cycle.seed.harvestInstructions}</Text></AppCard>
    <AppCard style={styles.storage}><Ionicons color={tokens.colors.olive} name="leaf-outline" size={tokens.layout.icon.md} /><View style={styles.storageCopy}><Text style={styles.cardLabel}>KEEP IT FRESH</Text><Text style={styles.body}>{cycle.seed.storageGuidance}</Text></View></AppCard>
    <View style={styles.photoSection}><Text style={styles.sectionTitle}>A private harvest photo</Text><Text style={styles.body}>Optional. This stays in your Private Garden and is never shared publicly.</Text>{photo ? <View style={styles.selectedPhoto}><Image accessibilityLabel="Selected harvest photo" source={{ uri: photo.uri }} style={styles.selectedImage} /><Pressable accessibilityLabel="Remove harvest photo" onPress={() => setPhoto(null)} style={styles.remove}><Ionicons color={tokens.colors.stone} name="close" size={20} /></Pressable></View> : <AppButton label="Add a photo" onPress={() => void choosePhoto().catch((reason: unknown) => setSelectionError(toMessage(reason)))} variant="secondary" />}{selectionError ? <Text accessibilityLiveRegion="polite" style={styles.error}>{selectionError}</Text> : null}</View>
    <AppButton label="Not sure? Check with a photo" onPress={() => router.push(`/cycle/${cycle.cycle.id}/check?type=harvest_readiness`)} variant="oliveText" />
    {mutation.error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{mutation.error.message}</Text> : null}
    <AppButton disabled={cycle.priority !== "harvest_ready" && cycle.cycle.status !== "harvested"} label={cycle.cycle.status === "harvested" ? "Continue to saved harvest" : "Mark as harvested"} loading={mutation.loading} onPress={() => void finish().catch(() => undefined)} />
  </ScreenContainer>;
}
function normalizeContentType(value: string | undefined): CapturedPhoto["contentType"] { if (value === "image/png" || value === "image/webp") return value; if (!value || value === "image/jpeg") return "image/jpeg"; throw new Error("Use a JPEG, PNG, or WebP image."); }
function toMessage(reason: unknown) { return reason instanceof Error ? reason.message : "The photo could not be selected."; }
const styles = StyleSheet.create({ container: { gap: tokens.spacing.cardGap, paddingBottom: tokens.spacing.xl }, header: { alignItems: "center", flexDirection: "row", gap: tokens.spacing.md }, headerButton: { alignItems: "center", height: tokens.layout.size.touchTarget, justifyContent: "center", width: tokens.layout.size.touchTarget }, eyebrow: { ...tokens.typography.label, color: tokens.colors.oliveLabel }, intro: { gap: tokens.spacing.sm, marginHorizontal: tokens.spacing.md }, title: { ...tokens.typography.displayLarge, color: tokens.colors.terracottaText }, body: { ...tokens.typography.body, color: tokens.colors.ink82 }, hero: { aspectRatio: 16 / 10, height: undefined }, instruction: { gap: tokens.spacing.sm }, cardLabel: { ...tokens.typography.label, color: tokens.colors.oliveLabel }, cardTitle: { ...tokens.typography.cardTitle, color: tokens.colors.forest }, storage: { alignItems: "center", flexDirection: "row", gap: tokens.spacing.md }, storageCopy: { flex: 1, gap: tokens.spacing.xs }, photoSection: { gap: tokens.spacing.sm, marginHorizontal: tokens.spacing.md }, sectionTitle: { ...tokens.typography.cardTitle, color: tokens.colors.forest }, selectedPhoto: { position: "relative" }, selectedImage: { aspectRatio: 4 / 3, borderRadius: tokens.radii.media, width: "100%" }, remove: { alignItems: "center", backgroundColor: tokens.colors.forest, borderRadius: 999, height: 36, justifyContent: "center", position: "absolute", right: tokens.spacing.sm, top: tokens.spacing.sm, width: 36 }, error: { ...tokens.typography.bodyStrong, color: tokens.colors.alert, textAlign: "center" } });
