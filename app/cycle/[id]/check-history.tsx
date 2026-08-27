import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useCycle } from "@/src/presentation/cycles/useCycleData";
import { usePhotoCheckHistory } from "@/src/presentation/photoChecks/usePhotoChecks";
import { AppCard, BackHeader, FeedbackState, ScreenContainer } from "@/src/ui/components";
import { tokens } from "@/src/ui/tokens";

export default function CheckHistoryScreen() {
  const router = useRouter(); const { id } = useLocalSearchParams<{ id?: string }>(); const history = usePhotoCheckHistory(id); const cycleResource = useCycle(id); const cycle = cycleResource.data;
  if (history.loading || cycleResource.loading) return <ScreenContainer><FeedbackState kind="loading" title="Loading check history" description="Your saved checks will appear shortly." /></ScreenContainer>;
  if (history.error || cycleResource.error) return <ScreenContainer><FeedbackState kind="error" title="History is unavailable" description={(history.error ?? cycleResource.error)?.message ?? "Try again."} actionLabel="Try again" onAction={() => void Promise.all([history.reload(), cycleResource.reload()])} /></ScreenContainer>;
  return <ScreenContainer scroll contentStyle={styles.container}>
    <BackHeader center={<Text style={styles.title}>Check history</Text>} />
    {cycle ? <Text style={styles.context}>{cycle.seed.commonName} · {cycle.phase} · Day {cycle.day}</Text> : null}
    {history.data.length === 0 ? <FeedbackState kind="empty" title="No checks yet" description="Take a photo when you want help understanding this cycle." actionLabel="Start a check" onAction={() => router.replace(`/cycle/${id}/check`)} /> : history.data.map((record) => <Pressable key={record.id} onPress={() => router.push({ pathname: "/cycle/[id]/check-result", params: { id: id ?? "", checkId: record.id } })}><AppCard style={styles.row}><View style={styles.rowTop}><Text style={styles.rowTitle}>{record.result.headline}</Text><View style={[styles.status, statusStyle(record.status)]}><Text style={styles.statusText}>{record.status.replaceAll("_", " ")}</Text></View></View><Text numberOfLines={2} style={styles.body}>{record.result.actions[0]}</Text><Text style={styles.meta}>{formatDate(record.submittedAt)} · {record.checkType.replaceAll("_", " ")}</Text></AppCard></Pressable>)}
  </ScreenContainer>;
}

function statusStyle(status: string) { return { backgroundColor: status === "on_track" || status === "harvest_likely" ? tokens.colors.sage : status === "issue_likely" ? tokens.colors.terracottaText : tokens.colors.olive }; }
function formatDate(value: string) { return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
const styles = StyleSheet.create({ container: { gap: tokens.spacing.cardGap, paddingBottom: tokens.spacing.xl }, title: { ...tokens.typography.display, color: tokens.colors.terracottaText }, context: { ...tokens.typography.bodyStrong, color: tokens.colors.ink64, marginHorizontal: tokens.spacing.md, textAlign: "center", textTransform: "capitalize" }, row: { gap: tokens.spacing.sm }, rowTop: { alignItems: "center", flexDirection: "row", gap: tokens.spacing.sm, justifyContent: "space-between" }, rowTitle: { ...tokens.typography.cardTitle, color: tokens.colors.forest, flex: 1 }, status: { borderRadius: 999, paddingHorizontal: tokens.spacing.sm, paddingVertical: tokens.spacing.xs }, statusText: { ...tokens.typography.caption, color: tokens.colors.stone, textTransform: "capitalize" }, body: { ...tokens.typography.body, color: tokens.colors.ink }, meta: { ...tokens.typography.label, color: tokens.colors.oliveLabel, textTransform: "uppercase" } });
