import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, StyleSheet, Text, View } from "react-native";

import { useCycle } from "@/src/presentation/cycles/useCycleData";
import { usePhotoCheck } from "@/src/presentation/photoChecks/usePhotoChecks";
import { AppButton, AppCard, FeedbackState, PhotoFrame, ScreenContainer } from "@/src/ui/components";
import { tokens } from "@/src/ui/tokens";

export default function PhotoCheckResultScreen() {
  const router = useRouter();
  const { id, checkId } = useLocalSearchParams<{ id?: string; checkId?: string }>();
  const resource = usePhotoCheck(checkId); const cycleResource = useCycle(id);
  const record = resource.data; const cycle = cycleResource.data;
  if (resource.loading || cycleResource.loading) return <ScreenContainer><FeedbackState kind="loading" title="Preparing your result" description="Validating the saved fixture result." /></ScreenContainer>;
  if (resource.error || cycleResource.error) return <ScreenContainer><FeedbackState kind="error" title="The result is unavailable" description={(resource.error ?? cycleResource.error)?.message ?? "Try again."} actionLabel="Try again" onAction={() => void Promise.all([resource.reload(), cycleResource.reload()])} /></ScreenContainer>;
  if (!record || !cycle) return <ScreenContainer><FeedbackState kind="empty" title="Result not found" description="Return to this cycle and start another check." actionLabel="Back to cycle" onAction={() => router.replace(`/cycle/${id}`)} /></ScreenContainer>;
  const retry = record.status === "unclear" || record.status === "rejected" || record.status === "provider_error";
  const success = record.status === "on_track" || record.status === "harvest_likely";
  function confirmDelete() { Alert.alert("Delete this check?", "The submitted photo and its saved AI guidance will be permanently deleted.", [{ text: "Cancel", style: "cancel" }, { text: "Delete check", style: "destructive", onPress: () => void resource.deleteCheck().then(() => router.replace(`/cycle/${id}/check-history`)) }]); }
  return <ScreenContainer scroll contentStyle={[styles.container, retry && styles.retryContainer]}>
    <View style={[styles.icon, retry ? styles.iconWarning : styles.iconSuccess]}><Ionicons color={retry ? tokens.colors.terracottaText : tokens.colors.sage} name={retry ? "camera-outline" : success ? "checkmark-circle-outline" : "leaf-outline"} size={48} /></View>
    <Text style={styles.eyebrow}>{retry ? "CHECK NEEDS ANOTHER PHOTO" : "ANALYSIS COMPLETE"}</Text>
    <Text style={styles.title}>{record.result.headline}</Text>
    <Text style={styles.context}>{cycle.seed.commonName} · {cycle.phase} · Day {cycle.day}</Text>
    {!retry && resource.photoUrl ? <PhotoFrame accessibilityLabel="Photo submitted for this check" source={{ uri: resource.photoUrl }} style={styles.photo} /> : null}
    <AppCard style={styles.summary}><Text style={styles.label}>COACH SUMMARY</Text><Text style={styles.explanation}>{record.result.explanation}</Text>{record.result.causes?.length ? <View style={styles.causes}>{record.result.causes.map((cause) => <View key={cause} style={styles.cause}><Text style={styles.causeText}>{cause}</Text></View>)}</View> : null}<View style={styles.action}><Text style={styles.label}>NEXT ACTION</Text>{record.result.actions.map((action) => <Text key={action} style={styles.actionText}>{action}</Text>)}</View>{record.result.retakeGuidance ? <Text style={styles.retake}>{record.result.retakeGuidance}</Text> : null}</AppCard>
    <Text style={styles.quota}>{record.quotaConsumed ? "This successful fixture result is marked as allowance-consuming." : "No allowance was consumed for this result."}</Text>
    {retry ? <AppButton label="Retake photo" onPress={() => router.replace(`/cycle/${id}/check`)} /> : null}
    <AppButton label="Back to cycle" onPress={() => router.replace(`/cycle/${id}`)} variant={retry ? "ghost" : "primary"} />
    <AppButton label="View check history" onPress={() => router.push(`/cycle/${id}/check-history`)} variant="oliveText" />
    <AppButton label="Delete this check" onPress={confirmDelete} variant="text" />
  </ScreenContainer>;
}

const styles = StyleSheet.create({
  container: { alignItems: "stretch", gap: tokens.spacing.cardGap, paddingBottom: tokens.spacing.xl }, retryContainer: { justifyContent: "center" }, icon: { alignItems: "center", alignSelf: "center", backgroundColor: tokens.colors.card, borderRadius: 999, height: 112, justifyContent: "center", width: 112, ...tokens.elevation.raisedMd }, iconSuccess: { borderColor: tokens.colors.sage, borderWidth: 1 }, iconWarning: { borderColor: tokens.colors.terracotta, borderWidth: 1 },
  eyebrow: { ...tokens.typography.label, color: tokens.colors.oliveLabel, textAlign: "center" }, title: { ...tokens.typography.displayLarge, color: tokens.colors.terracottaText, textAlign: "center" }, context: { ...tokens.typography.bodyStrong, color: tokens.colors.ink64, textAlign: "center", textTransform: "capitalize" }, photo: { aspectRatio: 16 / 10, height: undefined }, summary: { gap: tokens.spacing.md }, label: { ...tokens.typography.label, color: tokens.colors.oliveLabel }, explanation: { ...tokens.typography.body, color: tokens.colors.ink }, causes: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing.xs }, cause: { backgroundColor: tokens.colors.stone, borderRadius: 999, paddingHorizontal: tokens.spacing.sm, paddingVertical: tokens.spacing.xs }, causeText: { ...tokens.typography.caption, color: tokens.colors.alert }, action: { backgroundColor: tokens.colors.stone, borderRadius: tokens.radii.button, gap: tokens.spacing.xs, padding: tokens.spacing.md }, actionText: { ...tokens.typography.cardTitle, color: tokens.colors.forest }, retake: { ...tokens.typography.bodyStrong, color: tokens.colors.ink82 }, quota: { ...tokens.typography.caption, color: tokens.colors.ink64, textAlign: "center" }
});
