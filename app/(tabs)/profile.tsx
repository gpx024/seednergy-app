import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppButton, AppCard, FeedbackState, ScreenContainer } from "@/src/ui/components";
import { tokens } from "@/src/ui/tokens";
import { useAuth } from "@/src/presentation/auth/AuthProvider";
import { useProfile } from "@/src/presentation/profile/useProfile";
import { featureFlags } from "@/src/config/features";

const alba = require("../../assets/images/profiles/alba-temporary.png");

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const profile = useProfile();
  const displayName = profile.data?.displayName ?? (typeof user?.user_metadata.display_name === "string" ? user.user_metadata.display_name : t("main.albaName"));
  const environment = profile.data?.environment ? labelValue(profile.data.environment) : t("main.notConnected");
  const light = profile.data?.lightCondition ? labelValue(profile.data.lightCondition) : t("main.notConnected");
  return (
    <ScreenContainer includeBottomSafeArea={false} scroll contentStyle={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>{t("main.profile")}</Text>
      {profile.loading ? <FeedbackState kind="loading" title={t("profile.loading")} description={t("profile.loadingBody")} /> : null}
      {profile.error ? <FeedbackState actionLabel={t("content.tryAgain")} description={profile.error.message} kind="error" onAction={() => void profile.reload()} title={t("profile.error")} /> : null}
      <AppCard variant="hero" style={styles.identity}><Image accessibilityLabel={t("main.albaPortrait")} source={alba} style={styles.avatar} /><View style={styles.identityCopy}><Text style={styles.name}>{displayName}</Text><Text style={styles.identityMeta}>{user?.email ?? t("main.albaMeta")}</Text></View></AppCard>
      <SettingsGroup label={t("main.yourSpace")} items={[{ icon: "location-outline", title: t("main.growingSpace"), value: environment }, { icon: "sunny-outline", title: t("profile.light"), value: light }]} />
      <SettingsGroup label="Your harvests" items={[{ icon: "images-outline", title: "Private harvest gallery", value: "Your completed cycles", onPress: () => router.push("/(tabs)/garden") }]} />
      <SettingsGroup label={t("main.account")} items={[{ icon: "person-outline", title: t("main.accountDetails"), value: user?.email ?? t("main.albaEmail") }, { icon: "notifications-outline", title: "Notifications", value: featureFlags.pushNotifications ? profile.data?.notificationPreferences.enabled ? "Enabled" : "Off" : t("release.availableBeforeLaunch"), onPress: () => router.push("/settings") }, { icon: "shield-checkmark-outline", title: "Account and privacy", value: "Data, legal and help", onPress: () => router.push("/settings/privacy") }]} />
      <AppButton label={t("onboarding.signOut")} onPress={() => void signOut()} variant="secondary" />
    </ScreenContainer>
  );
}

function labelValue(value: string): string { return value.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase()); }

function SettingsGroup({ label, items }: { label: string; items: { icon: keyof typeof Ionicons.glyphMap; title: string; value: string; onPress?: () => void }[] }) {
  return <View style={styles.group}><Text style={styles.groupLabel}>{label}</Text><AppCard style={styles.list}>{items.map((item, index) => <Pressable accessibilityRole={item.onPress ? "button" : undefined} disabled={!item.onPress} key={item.title} onPress={item.onPress} style={[styles.row, index > 0 && styles.rowBorder]}><Ionicons color={tokens.colors.oliveLabel} name={item.icon} size={tokens.layout.icon.md} /><View style={styles.rowCopy}><Text style={styles.rowTitle}>{item.title}</Text><Text style={styles.rowValue}>{item.value}</Text></View>{item.onPress ? <Ionicons color={tokens.colors.ink64} name="chevron-forward" size={tokens.layout.icon.sm} /> : null}</Pressable>)}</AppCard></View>;
}

const styles = StyleSheet.create({
  container: { gap: tokens.spacing.sectionGap, paddingBottom: tokens.spacing.xs },
  title: { ...tokens.typography.displayLarge, color: tokens.colors.terracottaText, marginHorizontal: tokens.spacing.md },
  identity: { alignItems: "center", flexDirection: "row", gap: tokens.spacing.md },
  avatar: { height: 92, width: 92, borderRadius: tokens.radii.pill, ...tokens.elevation.photo },
  identityCopy: { flex: 1, gap: tokens.spacing.xxs },
  name: { ...tokens.typography.cardTitle, color: tokens.colors.forest },
  identityMeta: { ...tokens.typography.body, color: tokens.colors.ink82 },
  group: { gap: tokens.spacing.sm },
  groupLabel: { ...tokens.typography.label, color: tokens.colors.oliveLabel, marginHorizontal: tokens.spacing.md, textTransform: "uppercase" },
  list: { padding: 0, overflow: "hidden" },
  row: { alignItems: "center", flexDirection: "row", gap: tokens.spacing.sm, minHeight: 66, paddingHorizontal: tokens.spacing.md },
  rowBorder: { borderTopColor: tokens.colors.border, borderTopWidth: 1 },
  rowCopy: { flex: 1, gap: 2 },
  rowTitle: { ...tokens.typography.panelHeadline, color: tokens.colors.ink },
  rowValue: { ...tokens.typography.caption, color: tokens.colors.ink64 }
});
