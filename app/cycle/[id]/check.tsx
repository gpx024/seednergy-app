import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { featureFlags } from "@/src/config/features";
import { useAuth } from "@/src/presentation/auth/AuthProvider";
import { useCycle } from "@/src/presentation/cycles/useCycleData";
import { developmentPhotoCheckFixtureIds, useSubmitPhotoCheck, type CapturedPhoto, type PhotoCheckType } from "@/src/presentation/photoChecks/usePhotoChecks";
import { useProfile } from "@/src/presentation/profile/useProfile";
import { AppButton, AppCard, FeedbackState, ScreenContainer } from "@/src/ui/components";
import { tokens } from "@/src/ui/tokens";

const checkTypes: { value: PhotoCheckType; label: string }[] = [
  { value: "progress", label: "Progress" }, { value: "issue", label: "Issue" },
  { value: "stage_review", label: "Stage review" }, { value: "harvest_readiness", label: "Harvest readiness" }
];

const guide = [
  ["sunny-outline", "Natural light"], ["scan-outline", "Frame the whole tray"],
  ["search-outline", "Get close"], ["aperture-outline", "Sharp focus"], ["eye-outline", "No obstruction"]
] as const;

export default function PhotoCheckScreen() {
  const router = useRouter();
  const { id, type } = useLocalSearchParams<{ id?: string; type?: string }>();
  const auth = useAuth(); const cycleResource = useCycle(id); const profile = useProfile(); const mutation = useSubmitPhotoCheck();
  const [photo, setPhoto] = useState<CapturedPhoto | null>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [checkType, setCheckType] = useState<PhotoCheckType>(type === "harvest_readiness" ? "harvest_readiness" : "progress");
  const [fixtureId, setFixtureId] = useState("AI-001");
  const cycle = cycleResource.data;

  useEffect(() => {
    if (!profile.loading && profile.data && !profile.data.aiPhotoNoticeAcceptedAt && id) router.replace({ pathname: "/cycle/[id]/photo-notice", params: { id, ...(type ? { type } : {}) } });
  }, [id, profile.data, profile.loading, router, type]);

  async function choose(source: "camera" | "library") {
    mutation.clearError();
    setSelectionError(null);
    if (source === "camera") {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) throw new Error("Camera permission is needed to take a growth photo.");
    }
    const result = source === "camera"
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.75 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.75 });
    const asset = result.assets?.[0];
    if (!result.canceled && asset) setPhoto({ uri: asset.uri, fileName: asset.fileName ?? `cycle-${Date.now()}.jpg`, contentType: normalizeContentType(asset.mimeType), fileSize: asset.fileSize ?? null });
  }

  async function submit() {
    if (!cycle || !photo || !auth.user) return;
    const checkId = await mutation.submit({ userId: auth.user.id, cycle, lightCondition: profile.data?.lightCondition ?? null, photo, checkType, fixtureId });
    router.replace({ pathname: "/cycle/[id]/check-result", params: { id: cycle.cycle.id, checkId } });
  }

  if (cycleResource.loading || profile.loading) return <ScreenContainer><FeedbackState kind="loading" title="Preparing your growth check" description="Loading this cycle’s authored context." /></ScreenContainer>;
  if (cycleResource.error || profile.error) return <ScreenContainer><FeedbackState kind="error" title="This check is unavailable" description={(cycleResource.error ?? profile.error)?.message ?? "Try again."} actionLabel="Try again" onAction={() => void Promise.all([cycleResource.reload(), profile.reload()])} /></ScreenContainer>;
  if (!cycle) return <ScreenContainer><FeedbackState kind="empty" title="Cycle not found" description="Return to your cycles and choose an active grow." /></ScreenContainer>;
  if (!profile.data?.aiPhotoNoticeAcceptedAt) return <ScreenContainer><FeedbackState kind="loading" title="Preparing your privacy notice" description="Your first photo check starts with a clear explanation of how the image is used." /></ScreenContainer>;

  return <ScreenContainer scroll contentStyle={styles.container}>
    <Pressable accessibilityLabel="Back" accessibilityRole="button" hitSlop={12} onPress={() => router.back()} style={styles.back}><Ionicons color={tokens.colors.ink} name="arrow-back" size={tokens.layout.icon.lg} /></Pressable>
    <View style={styles.intro}><Text style={styles.eyebrow}>ACTIVE CYCLE</Text><Text style={styles.title}>Check your growth</Text><Text style={styles.context}>{cycle.seed.commonName} · {cycle.phase} · Day {cycle.day}</Text></View>
    <View style={styles.section}><Text style={styles.label}>CHECK TYPE</Text><ScrollView horizontal contentContainerStyle={styles.choiceRow} showsHorizontalScrollIndicator={false}>{checkTypes.map((item) => <Pressable key={item.value} onPress={() => setCheckType(item.value)} style={[styles.choice, checkType === item.value && styles.choiceActive]}><Text style={[styles.choiceText, checkType === item.value && styles.choiceTextActive]}>{item.label}</Text></Pressable>)}</ScrollView></View>
    {photo ? <>
      <View style={styles.photoFrame}><Image accessibilityLabel="Selected cycle photo" resizeMode="cover" source={{ uri: photo.uri }} style={styles.photo} /></View>
      <Text style={styles.label}>BEST RESULTS GUIDE</Text><View style={styles.guideGrid}>{guide.map(([icon, label]) => <View key={label} style={styles.guideItem}><Ionicons color={tokens.colors.forest} name={icon} size={tokens.layout.icon.md} /><Text style={styles.guideText}>{label}</Text></View>)}</View>
      {featureFlags.fixturePhotoChecks ? <View style={styles.fixtureBlock}><Text style={styles.label}>DEVELOPMENT FIXTURE</Text><Text style={styles.fixtureHelp}>Fixtures demonstrate UI states only. They do not analyse this photo.</Text><View style={styles.fixtureRow}>{developmentPhotoCheckFixtureIds.map((fixture) => <Pressable key={fixture} onPress={() => setFixtureId(fixture)} style={[styles.fixture, fixtureId === fixture && styles.fixtureActive]}><Text style={[styles.fixtureText, fixtureId === fixture && styles.fixtureTextActive]}>{fixture}</Text></Pressable>)}</View></View> : null}
      {mutation.error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{mutation.error.message}</Text> : null}
      <AppButton label="Check growth" loading={mutation.loading} onPress={() => void submit()} />
      <AppButton label="Choose another photo" onPress={() => setPhoto(null)} variant="ghost" />
    </> : <AppCard style={styles.entry}><View style={styles.captureIcon}><Ionicons color={tokens.colors.forest} name="scan-outline" size={44} /></View><Text style={styles.entryTitle}>Take a clear plant photo</Text><Text style={styles.entryBody}>Use natural light, include the whole tray, move close enough to see the leaves, keep it in focus, and remove anything blocking the plant.</Text>{selectionError ? <Text accessibilityLiveRegion="polite" style={styles.error}>{selectionError}</Text> : null}<AppButton label="Take photo" onPress={() => void choose("camera").catch((reason: unknown) => setSelectionError(toErrorMessage(reason)))} /><AppButton label="Upload from gallery" onPress={() => void choose("library").catch((reason: unknown) => setSelectionError(toErrorMessage(reason)))} variant="ghost" /></AppCard>}
    <AppButton label="View check history" onPress={() => router.push(`/cycle/${cycle.cycle.id}/check-history`)} variant="oliveText" />
    <AppCard variant="muted" style={styles.notice}><Ionicons color={tokens.colors.forest} name="shield-checkmark-outline" size={tokens.layout.icon.md} /><Text style={styles.noticeText}>{featureFlags.fixturePhotoChecks ? "Fixture mode demonstrates UI states without making an AI call." : "Your photo is checked securely through Seednergy’s server. No AI key is stored on this phone."}</Text></AppCard>
  </ScreenContainer>;
}

function normalizeContentType(value: string | undefined): CapturedPhoto["contentType"] {
  if (value === "image/png" || value === "image/webp") return value;
  if (value === undefined || value === "image/jpeg") return "image/jpeg";
  throw new Error("Use a JPEG, PNG, or WebP image.");
}

function toErrorMessage(reason: unknown) { return reason instanceof Error ? reason.message : "The photo could not be selected."; }

const styles = StyleSheet.create({
  container: { gap: tokens.spacing.cardGap, paddingBottom: tokens.spacing.xl }, back: { alignItems: "center", height: tokens.layout.size.touchTarget, justifyContent: "center", width: tokens.layout.size.touchTarget },
  intro: { gap: tokens.spacing.xs, marginHorizontal: tokens.spacing.md }, eyebrow: { ...tokens.typography.label, color: tokens.colors.oliveLabel }, title: { ...tokens.typography.displayLarge, color: tokens.colors.terracottaText }, context: { ...tokens.typography.title, color: tokens.colors.forest },
  section: { gap: tokens.spacing.xs }, label: { ...tokens.typography.label, color: tokens.colors.oliveLabel }, choiceRow: { gap: tokens.spacing.xs, paddingVertical: tokens.spacing.xs }, choice: { backgroundColor: tokens.colors.card, borderRadius: 999, paddingHorizontal: tokens.spacing.md, paddingVertical: tokens.spacing.sm, ...tokens.elevation.raisedSm }, choiceActive: { backgroundColor: tokens.colors.olive }, choiceText: { ...tokens.typography.bodyStrong, color: tokens.colors.oliveLabel }, choiceTextActive: { color: tokens.colors.stone },
  entry: { alignItems: "center", gap: tokens.spacing.md, paddingVertical: tokens.spacing.xl }, captureIcon: { alignItems: "center", backgroundColor: tokens.colors.card, borderRadius: 999, height: 112, justifyContent: "center", width: 112, ...tokens.elevation.raisedSm }, entryTitle: { ...tokens.typography.cardTitle, color: tokens.colors.forest, textAlign: "center" }, entryBody: { ...tokens.typography.body, color: tokens.colors.ink82, textAlign: "center" },
  photoFrame: { backgroundColor: tokens.colors.card, borderRadius: tokens.radii.media, padding: 6, ...tokens.elevation.raisedLg }, photo: { aspectRatio: 4 / 3, borderRadius: 20, width: "100%" }, guideGrid: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing.xs }, guideItem: { alignItems: "center", backgroundColor: tokens.colors.card, borderRadius: tokens.radii.button, flexDirection: "row", gap: tokens.spacing.xs, paddingHorizontal: tokens.spacing.sm, paddingVertical: tokens.spacing.sm }, guideText: { ...tokens.typography.caption, color: tokens.colors.ink },
  fixtureBlock: { gap: tokens.spacing.xs }, fixtureHelp: { ...tokens.typography.caption, color: tokens.colors.ink64 }, fixtureRow: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing.xs }, fixture: { backgroundColor: tokens.colors.card, borderRadius: 999, paddingHorizontal: tokens.spacing.sm, paddingVertical: tokens.spacing.xs }, fixtureActive: { backgroundColor: tokens.colors.terracottaText }, fixtureText: { ...tokens.typography.caption, color: tokens.colors.ink }, fixtureTextActive: { color: tokens.colors.stone },
  error: { ...tokens.typography.bodyStrong, color: tokens.colors.alert, textAlign: "center" }, notice: { alignItems: "center", flexDirection: "row", gap: tokens.spacing.sm }, noticeText: { ...tokens.typography.caption, color: tokens.colors.ink82, flex: 1 }
});
