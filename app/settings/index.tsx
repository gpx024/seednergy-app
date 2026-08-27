import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import type { NotificationFrequency } from "@/src/ports/NotificationService";
import { useNotificationPreferences } from "@/src/presentation/notifications/useNotificationPreferences";
import { AppButton, AppCard, BackHeader, FeedbackState, ScreenContainer } from "@/src/ui/components";
import { tokens } from "@/src/ui/tokens";
import { featureFlags } from "@/src/config/features";

const choices: { value: NotificationFrequency; title: string; description: string }[] = [
  { value: "daily", title: "Daily check-ins", description: "Only when a cycle has a genuine action due." },
  { value: "every_other_day", title: "Every other day", description: "A quieter rhythm for slower grows." },
  { value: "important_only", title: "Important alerts only", description: "Harvest-ready actions only." }
];

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { preferences, setPreferences, loading, saving, error, save } = useNotificationPreferences();

  async function saveAndClose() { await save(); router.back(); }

  return <ScreenContainer scroll contentStyle={styles.container}>
    <BackHeader center={<Text accessibilityRole="header" style={styles.title}>Notifications</Text>} />
    {!featureFlags.pushNotifications ? <><FeedbackState kind="empty" title={t("release.remindersTitle")} description={t("release.remindersBody")} /><AppButton label={t("release.backToProfile")} onPress={() => router.back()} /></> : null}
    {featureFlags.pushNotifications ? <>
    {loading ? <FeedbackState kind="loading" title="Loading preferences" description="Reading your current reminder settings." /> : null}
    {error ? <FeedbackState kind="error" title="Could not save preferences" description={error.message} /> : null}
    {!loading ? <><AppCard style={styles.toggle}><View style={styles.toggleCopy}><Text style={styles.cardTitle}>Enable notifications</Text><Text style={styles.body}>Get a gentle reminder only when your cycle has a real next action.</Text></View><Switch accessibilityLabel="Enable notifications" onValueChange={(enabled) => setPreferences((current) => ({ ...current, enabled }))} thumbColor={tokens.colors.card} trackColor={{ false: tokens.colors.border, true: tokens.colors.forest }} value={preferences.enabled} /></AppCard>
      <View style={styles.section}><Text style={styles.label}>Frequency</Text>{choices.map((choice) => <Pressable accessibilityRole="radio" accessibilityState={{ checked: preferences.frequency === choice.value }} key={choice.value} onPress={() => setPreferences((current) => ({ ...current, frequency: choice.value }))}><AppCard style={[styles.choice, preferences.frequency === choice.value && styles.choiceSelected]}><View style={styles.choiceCopy}><Text style={styles.choiceTitle}>{choice.title}</Text><Text style={styles.body}>{choice.description}</Text></View><Ionicons color={preferences.frequency === choice.value ? tokens.colors.forest : tokens.colors.border} name={preferences.frequency === choice.value ? "checkmark-circle" : "ellipse-outline"} size={24} /></AppCard></Pressable>)}</View>
      <AppCard variant="nested" style={styles.note}><Text style={styles.noteLabel}>Quiet hours</Text><Text style={styles.noteTitle}>{preferences.quietStart} to {preferences.quietEnd}</Text><Text style={styles.noteBody}>Anything due overnight waits until morning. Seednergy sends no generic engagement notifications.</Text></AppCard>
      <AppButton label="Save preferences" loading={saving} onPress={() => void saveAndClose().catch(() => undefined)} /></> : null}</> : null}
  </ScreenContainer>;
}

const styles = StyleSheet.create({ container: { gap: tokens.spacing.sectionGap }, title: { ...tokens.typography.displayMedium, color: tokens.colors.terracottaText }, toggle: { alignItems: "center", flexDirection: "row", gap: tokens.spacing.md }, toggleCopy: { flex: 1, gap: tokens.spacing.xs }, cardTitle: { ...tokens.typography.cardTitle, color: tokens.colors.forest }, body: { ...tokens.typography.body, color: tokens.colors.ink82 }, section: { gap: tokens.spacing.sm }, label: { ...tokens.typography.label, color: tokens.colors.oliveLabel, textTransform: "uppercase" }, choice: { alignItems: "center", flexDirection: "row", gap: tokens.spacing.sm }, choiceSelected: { borderColor: tokens.colors.forest, borderWidth: 2 }, choiceCopy: { flex: 1, gap: tokens.spacing.xxs }, choiceTitle: { ...tokens.typography.panelHeadline, color: tokens.colors.ink }, note: { gap: tokens.spacing.sm }, noteLabel: { ...tokens.typography.label, color: tokens.colors.coachLabel, textTransform: "uppercase" }, noteTitle: { ...tokens.typography.cardTitle, color: tokens.colors.raised }, noteBody: { ...tokens.typography.body, color: tokens.colors.raised } });
