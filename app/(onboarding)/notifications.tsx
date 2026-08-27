import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppButton, ScreenContainer } from "@/src/ui/components";
import { tokens } from "@/src/ui/tokens";

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const finishOnboarding = () => router.replace("/(tabs)/home");
  return <ScreenContainer contentStyle={styles.container}><View style={styles.content}><View style={styles.bell}><Ionicons color={tokens.colors.stone} name="notifications-outline" size={tokens.layout.icon.xl} /></View><Text accessibilityRole="header" style={styles.title}>{t("onboarding.notificationsTitle")}</Text><Text style={styles.body}>{t("onboarding.notificationsBody")}</Text></View><View style={styles.actions}><AppButton label={t("onboarding.enableReminders")} onPress={finishOnboarding} /><AppButton label={t("onboarding.notNow")} onPress={finishOnboarding} variant="text" /></View></ScreenContainer>;
}

const styles = StyleSheet.create({ container: { justifyContent: "space-between", paddingBottom: tokens.spacing.xl }, content: { alignItems: "center", flex: 1, gap: tokens.spacing.lg, justifyContent: "center", marginHorizontal: tokens.spacing.md }, bell: { alignItems: "center", justifyContent: "center", height: 92, width: 92, borderRadius: tokens.radii.card, backgroundColor: tokens.colors.terracottaPanel, ...tokens.elevation.nested }, title: { ...tokens.typography.display, color: tokens.colors.terracotta, textAlign: "center" }, body: { ...tokens.typography.body, color: tokens.colors.ink82, maxWidth: 310, textAlign: "center" }, actions: { gap: tokens.spacing.xs } });
