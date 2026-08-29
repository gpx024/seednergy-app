import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text } from "react-native";

import { useDeleteAccount } from "@/src/presentation/account/useDeleteAccount";
import { AppButton, AppCard, AppField, BackHeader, ScreenContainer } from "@/src/ui/components";
import { tokens } from "@/src/ui/tokens";

const confirmation = "DELETE";

export default function DeleteAccountScreen() {
  const router = useRouter(); const mutation = useDeleteAccount(); const [value, setValue] = useState("");
  async function remove() { await mutation.deleteAccount(); router.replace("/(onboarding)/welcome"); }
  return <ScreenContainer scroll contentStyle={styles.container}><BackHeader center={<Text accessibilityRole="header" style={styles.title}>Delete account</Text>} /><AppCard style={styles.warning}><Ionicons color={tokens.colors.alert} name="warning-outline" size={tokens.layout.icon.lg} /><Text style={styles.warningTitle}>This cannot be undone</Text><Text style={styles.body}>Seednergy will permanently remove your profile, cycles, events, photo checks, harvests, notification devices and every stored cycle photo. You will be logged out when deletion finishes.</Text></AppCard><AppButton label="Export my data first" loading={mutation.exporting} onPress={() => void mutation.exportData().catch(() => undefined)} variant="secondary" /><AppField autoCapitalize="characters" autoCorrect={false} label={`Type ${confirmation} to confirm`} onChangeText={setValue} value={value} />{mutation.error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{mutation.error.message}</Text> : null}<AppButton disabled={value.trim().toUpperCase() !== confirmation} label="Permanently delete my account" loading={mutation.loading} onPress={() => void remove().catch(() => undefined)} /><AppButton label="Keep my account" onPress={() => router.back()} variant="ghost" /></ScreenContainer>;
}

const styles = StyleSheet.create({ container: { gap: tokens.spacing.sectionGap, paddingBottom: tokens.spacing.xl }, title: { ...tokens.typography.displayMedium, color: tokens.colors.terracottaText }, warning: { alignItems: "center", gap: tokens.spacing.sm }, warningTitle: { ...tokens.typography.cardTitle, color: tokens.colors.alert, textAlign: "center" }, body: { ...tokens.typography.body, color: tokens.colors.ink82, textAlign: "center" }, error: { ...tokens.typography.bodyStrong, color: tokens.colors.alert, textAlign: "center" } });
