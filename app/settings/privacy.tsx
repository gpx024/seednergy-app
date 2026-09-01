import Ionicons from "@expo/vector-icons/Ionicons";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { legalLinks } from "@/src/config/legal";
import { featureFlags } from "@/src/config/features";
import { AppButton, AppCard, BackHeader, ScreenContainer } from "@/src/ui/components";
import { tokens } from "@/src/ui/tokens";

export default function PrivacySettingsScreen() {
  const router = useRouter();
  return <ScreenContainer scroll contentStyle={styles.container}>
    <BackHeader center={<Text accessibilityRole="header" style={styles.title}>Account and privacy</Text>} />
    <AppCard style={styles.card}><Text style={styles.cardTitle}>Your data</Text><Text style={styles.body}>Your cycles, checks and private harvests belong to your account. Check photos are processed securely to provide cycle-specific guidance.</Text></AppCard>
    <View style={styles.links}><LinkRow label="Privacy Policy" url={legalLinks.privacyPolicy} /><LinkRow label="Terms of Service" url={legalLinks.terms} /><LinkRow label="Help and FAQs" onPress={() => router.push("/settings/help")} /><LinkRow label="Support" url={legalLinks.support} />{featureFlags.monitoringVerification ? <LinkRow label="Monitoring verification" onPress={() => router.push("/settings/monitoring-verification")} /> : null}</View>
    {!legalLinks.privacyPolicy || !legalLinks.terms ? <AppCard variant="muted" style={styles.card}><Text style={styles.cardTitle}>Legal review pending</Text><Text style={styles.body}>The approved public Privacy Policy and Terms links have not been configured yet. They are required before release.</Text></AppCard> : null}
    <AppButton label="Delete account" onPress={() => router.push("/settings/delete-account")} />
  </ScreenContainer>;
}

function LinkRow({ label, url, onPress }: { label: string; url?: string; onPress?: () => void }) {
  const available = Boolean(onPress || url);
  return <Pressable accessibilityRole="button" disabled={!available} onPress={onPress ?? (() => { if (url) void Linking.openURL(url); })} style={[styles.linkRow, !available && styles.unavailable]}><Text style={styles.linkLabel}>{label}</Text><Text style={styles.linkMeta}>{available ? "Open" : "Not configured"}</Text><Ionicons color={tokens.colors.oliveLabel} name="chevron-forward" size={tokens.layout.icon.sm} /></Pressable>;
}

const styles = StyleSheet.create({ container: { gap: tokens.spacing.sectionGap, paddingBottom: tokens.spacing.xl }, title: { ...tokens.typography.displayMedium, color: tokens.colors.terracottaText }, card: { gap: tokens.spacing.sm }, cardTitle: { ...tokens.typography.cardTitle, color: tokens.colors.forest }, body: { ...tokens.typography.body, color: tokens.colors.ink82 }, links: { backgroundColor: tokens.colors.card, borderRadius: tokens.radii.card, overflow: "hidden", ...tokens.elevation.raisedMd }, linkRow: { alignItems: "center", borderBottomColor: tokens.colors.border, borderBottomWidth: 1, flexDirection: "row", gap: tokens.spacing.sm, minHeight: 62, paddingHorizontal: tokens.spacing.md }, unavailable: { opacity: 0.55 }, linkLabel: { ...tokens.typography.panelHeadline, color: tokens.colors.ink, flex: 1 }, linkMeta: { ...tokens.typography.caption, color: tokens.colors.ink64 } });
