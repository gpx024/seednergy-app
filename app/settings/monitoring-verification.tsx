import { useState } from "react";
import { Redirect } from "expo-router";
import { Alert, StyleSheet, Text } from "react-native";

import { featureFlags } from "@/src/config/features";
import { sendMonitoringVerificationEvent, triggerNativeMonitoringCrash } from "@/src/presentation/monitoring/verification";
import { AppButton, AppCard, BackHeader, ScreenContainer } from "@/src/ui/components";
import { tokens } from "@/src/ui/tokens";

export default function MonitoringVerificationScreen() {
  const [status, setStatus] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  if (!featureFlags.monitoringVerification) return <Redirect href="/settings/privacy" />;

  async function verify() {
    setSending(true);
    setStatus(null);
    try {
      const result = await sendMonitoringVerificationEvent();
      setStatus(result.flushed ? `Test event sent. Event ID: ${result.eventId}` : "The event was queued, but the upload did not finish within five seconds.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "The monitoring test could not be sent.");
    } finally {
      setSending(false);
    }
  }

  function confirmNativeCrash() {
    Alert.alert(
      "Crash this test build?",
      "The app will close immediately. Reopen it, then verify the native crash in Sentry.",
      [{ text: "Cancel", style: "cancel" }, { text: "Crash test build", style: "destructive", onPress: triggerNativeMonitoringCrash }]
    );
  }

  return <ScreenContainer scroll contentStyle={styles.container}>
    <BackHeader center={<Text accessibilityRole="header" style={styles.title}>Monitoring verification</Text>} />
    <AppCard style={styles.card}><Text style={styles.cardTitle}>Private test build only</Text><Text style={styles.body}>This sends one controlled error with no account, photo or request payload. Use the event ID to confirm the stack trace and source map in Sentry.</Text></AppCard>
    <AppButton label="Send Sentry test event" loading={sending} onPress={() => void verify()} />
    <AppButton label="Test native crash" onPress={confirmNativeCrash} variant="secondary" />
    {status ? <Text accessibilityLiveRegion="polite" selectable style={styles.status}>{status}</Text> : null}
  </ScreenContainer>;
}

const styles = StyleSheet.create({
  container: { gap: tokens.spacing.sectionGap, paddingBottom: tokens.spacing.xl },
  title: { ...tokens.typography.displayMedium, color: tokens.colors.terracottaText },
  card: { gap: tokens.spacing.sm },
  cardTitle: { ...tokens.typography.cardTitle, color: tokens.colors.forest },
  body: { ...tokens.typography.body, color: tokens.colors.ink82 },
  status: { ...tokens.typography.bodyStrong, color: tokens.colors.olive, textAlign: "center" }
});
