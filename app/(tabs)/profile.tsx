import Ionicons from "@expo/vector-icons/Ionicons";
import { Image, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppCard, BrandHeader, ScreenContainer } from "@/src/ui/components";
import { tokens } from "@/src/ui/tokens";

const alba = require("../../assets/images/profiles/alba-temporary.png");

export default function ProfileScreen() {
  const { t } = useTranslation();
  return (
    <ScreenContainer scroll contentStyle={styles.container}>
      <BrandHeader />
      <Text accessibilityRole="header" style={styles.title}>{t("main.profile")}</Text>
      <AppCard variant="hero" style={styles.identity}><Image accessibilityLabel={t("main.albaPortrait")} source={alba} style={styles.avatar} /><View style={styles.identityCopy}><Text style={styles.name}>{t("main.albaName")}</Text><Text style={styles.identityMeta}>{t("main.albaMeta")}</Text></View></AppCard>
      <SettingsGroup label={t("main.yourSpace")} items={[{ icon: "location-outline", title: t("main.growingSpace"), value: t("main.indoor") }, { icon: "notifications-outline", title: t("main.reminders"), value: t("main.daily") }]} />
      <SettingsGroup label={t("main.account")} items={[{ icon: "person-outline", title: t("main.accountDetails"), value: t("main.albaEmail") }, { icon: "settings-outline", title: t("main.settings"), value: t("main.previewOnly") }]} />
    </ScreenContainer>
  );
}

function SettingsGroup({ label, items }: { label: string; items: { icon: keyof typeof Ionicons.glyphMap; title: string; value: string }[] }) {
  return <View style={styles.group}><Text style={styles.groupLabel}>{label}</Text><AppCard style={styles.list}>{items.map((item, index) => <View key={item.title} style={[styles.row, index > 0 && styles.rowBorder]}><Ionicons color={tokens.colors.oliveLabel} name={item.icon} size={tokens.layout.icon.md} /><View style={styles.rowCopy}><Text style={styles.rowTitle}>{item.title}</Text><Text style={styles.rowValue}>{item.value}</Text></View><Ionicons color={tokens.colors.ink64} name="chevron-forward" size={tokens.layout.icon.sm} /></View>)}</AppCard></View>;
}

const styles = StyleSheet.create({
  container: { gap: tokens.spacing.sectionGap, paddingBottom: tokens.spacing.xl },
  title: { ...tokens.typography.displayLarge, color: tokens.colors.terracottaText },
  identity: { alignItems: "center", flexDirection: "row", gap: tokens.spacing.md },
  avatar: { height: 92, width: 92, borderRadius: tokens.radii.pill, ...tokens.elevation.photo },
  identityCopy: { flex: 1, gap: tokens.spacing.xxs },
  name: { ...tokens.typography.cardTitle, color: tokens.colors.forest },
  identityMeta: { ...tokens.typography.body, color: tokens.colors.ink82 },
  group: { gap: tokens.spacing.sm },
  groupLabel: { ...tokens.typography.label, color: tokens.colors.oliveLabel, textTransform: "uppercase" },
  list: { padding: 0, overflow: "hidden" },
  row: { alignItems: "center", flexDirection: "row", gap: tokens.spacing.sm, minHeight: 66, paddingHorizontal: tokens.spacing.md },
  rowBorder: { borderTopColor: tokens.colors.border, borderTopWidth: 1 },
  rowCopy: { flex: 1, gap: 2 },
  rowTitle: { ...tokens.typography.panelHeadline, color: tokens.colors.ink },
  rowValue: { ...tokens.typography.caption, color: tokens.colors.ink64 }
});
