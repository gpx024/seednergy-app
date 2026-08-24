import Ionicons from "@expo/vector-icons/Ionicons";
import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppButton, BrandHeader, ScreenContainer } from "@/src/ui/components";
import { tokens } from "@/src/ui/tokens";

export default function NotificationsScreen() {
  const { t } = useTranslation();
  return <ScreenContainer contentStyle={styles.container}><BrandHeader /><View style={styles.content}><View style={styles.bell}><Ionicons color={tokens.colors.stone} name="notifications-outline" size={tokens.layout.icon.xl} /></View><Text accessibilityRole="header" style={styles.title}>{t("onboarding.notificationsTitle")}</Text><Text style={styles.body}>{t("onboarding.notificationsBody")}</Text></View><View style={styles.actions}><Link asChild href="/home"><AppButton label={t("onboarding.enableReminders")} /></Link><Link asChild href="/home"><AppButton label={t("onboarding.notNow")} variant="text" /></Link></View></ScreenContainer>;
}

const styles = StyleSheet.create({ container: { justifyContent: "space-between", paddingBottom: tokens.spacing.xl }, content: { alignItems: "center", flex: 1, gap: tokens.spacing.lg, justifyContent: "center" }, bell: { alignItems: "center", justifyContent: "center", height: 92, width: 92, borderRadius: tokens.radii.card, backgroundColor: tokens.colors.terracottaPanel, ...tokens.elevation.nested }, title: { ...tokens.typography.display, color: tokens.colors.terracotta, textAlign: "center" }, body: { ...tokens.typography.body, color: tokens.colors.ink82, maxWidth: 310, textAlign: "center" }, actions: { gap: tokens.spacing.xs } });
