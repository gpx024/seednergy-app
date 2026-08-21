import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppCard, BrandMark, ScreenContainer } from "@/src/ui/components";
import { tokens } from "@/src/ui/tokens";

export default function ProfileScreen() {
  const { t } = useTranslation();
  return (
    <ScreenContainer scroll contentStyle={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>{t("main.profile")}</Text>
      <AppCard variant="hero" style={styles.rank}><View style={styles.rankMark}><BrandMark width={22} /></View><Text style={styles.rankLabel}>{t("main.currentPractice")}</Text><Text style={styles.rankValue}>{t("main.firstCycle")}</Text><View style={styles.track}><View style={styles.trackFill} /></View><Text style={styles.caption}>{t("main.profilePreview")}</Text></AppCard>
      <SettingsGroup label={t("main.yourSpace")} items={[{ icon: "location-outline", title: t("main.growingSpace"), value: t("main.indoor") }, { icon: "notifications-outline", title: t("main.reminders"), value: t("main.daily") }]} />
      <SettingsGroup label={t("main.account")} items={[{ icon: "person-outline", title: t("main.accountDetails"), value: t("main.notConnected") }, { icon: "settings-outline", title: t("main.settings"), value: t("main.previewOnly") }]} />
    </ScreenContainer>
  );
}

function SettingsGroup({ label, items }: { label: string; items: { icon: keyof typeof Ionicons.glyphMap; title: string; value: string }[] }) {
  return <View style={styles.group}><Text style={styles.groupLabel}>{label}</Text><AppCard style={styles.list}>{items.map((item, index) => <View key={item.title} style={[styles.row, index > 0 && styles.rowBorder]}><Ionicons color={tokens.colors.oliveLabel} name={item.icon} size={tokens.layout.icon.md} /><Text style={styles.rowTitle}>{item.title}</Text><Text style={styles.rowValue}>{item.value}</Text><Ionicons color={tokens.colors.ink64} name="chevron-forward" size={tokens.layout.icon.sm} /></View>)}</AppCard></View>;
}

const styles = StyleSheet.create({
  container: { gap: tokens.spacing.sectionGap, paddingBottom: tokens.spacing.xl },
  title: { ...tokens.typography.display, color: tokens.colors.terracotta },
  rank: { alignItems: "center", gap: tokens.spacing.sm },
  rankMark: { alignItems: "center", justifyContent: "center", height: 70, width: 70, borderRadius: tokens.radii.pill, backgroundColor: tokens.colors.card, ...tokens.elevation.raisedMd },
  rankLabel: { ...tokens.typography.label, color: tokens.colors.oliveLabel, textTransform: "uppercase" },
  rankValue: { ...tokens.typography.name, color: tokens.colors.forest },
  track: { height: 8, width: "100%", borderRadius: 4, backgroundColor: tokens.colors.card, ...tokens.elevation.raisedXs },
  trackFill: { height: 8, width: "26%", borderRadius: 4, backgroundColor: tokens.colors.olive },
  caption: { ...tokens.typography.caption, color: tokens.colors.ink64, textAlign: "center" },
  group: { gap: tokens.spacing.sm },
  groupLabel: { ...tokens.typography.label, color: tokens.colors.oliveLabel, textTransform: "uppercase" },
  list: { padding: 0, overflow: "hidden" },
  row: { alignItems: "center", flexDirection: "row", gap: tokens.spacing.sm, minHeight: 58, paddingHorizontal: tokens.spacing.md },
  rowBorder: { borderTopColor: tokens.colors.border, borderTopWidth: 1 },
  rowTitle: { ...tokens.typography.panelHeadline, color: tokens.colors.ink, flex: 1 },
  rowValue: { ...tokens.typography.caption, color: tokens.colors.ink64 }
});
