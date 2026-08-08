import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppCard, ScreenContainer, StageBadge } from "@/src/ui/components";
import { tokens } from "@/src/ui/tokens";

export default function ProfileScreen() {
  const { t } = useTranslation();

  return (
    <ScreenContainer scroll contentStyle={styles.container}>
      <View style={styles.intro}>
        <Text style={styles.eyebrow}>{t("stageTwo.profileEyebrow")}</Text>
        <Text accessibilityRole="header" style={styles.title}>{t("stageTwo.profileTitle")}</Text>
        <Text style={styles.description}>{t("stageTwo.profileDescription")}</Text>
      </View>
      <AppCard style={styles.profileCard}>
        <View style={styles.avatar}><Ionicons color={tokens.colors.actionPrimary} name="person-outline" size={tokens.layout.icon.lg} /></View>
        <View style={styles.cardCopy}>
          <StageBadge label={t("stageTwo.comingSoon")} tone="neutral" />
          <Text style={styles.cardTitle}>{t("stageTwo.profileCardTitle")}</Text>
          <Text style={styles.cardBody}>{t("stageTwo.profileCardDescription")}</Text>
        </View>
      </AppCard>
      <View style={styles.items}>
        <ProfileItem icon="location-outline" label={t("stageTwo.profileItemSpace")} value={t("stageTwo.profileItemPending")} />
        <ProfileItem icon="notifications-outline" label={t("stageTwo.profileItemReminders")} value={t("stageTwo.profileItemPending")} />
      </View>
    </ScreenContainer>
  );
}

function ProfileItem({ icon, label, value }: { icon: "location-outline" | "notifications-outline"; label: string; value: string }) {
  return (
    <AppCard variant="muted" style={styles.item}>
      <Ionicons color={tokens.colors.textSecondary} name={icon} size={tokens.layout.icon.lg} />
      <View style={styles.itemCopy}><Text style={styles.itemLabel}>{label}</Text><Text style={styles.itemValue}>{value}</Text></View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  container: { gap: tokens.spacing.xl, paddingBottom: tokens.spacing.xxxl },
  intro: { gap: tokens.spacing.sm },
  eyebrow: { ...tokens.typography.label, color: tokens.colors.textSubtle, textTransform: "uppercase" },
  title: { ...tokens.typography.display, color: tokens.colors.textPrimary },
  description: { ...tokens.typography.body, color: tokens.colors.textSecondary },
  profileCard: { alignItems: "center", flexDirection: "row", gap: tokens.spacing.lg, padding: tokens.spacing.lg },
  avatar: { alignItems: "center", backgroundColor: tokens.colors.actionSecondary, borderRadius: tokens.radii.pill, height: tokens.layout.size.avatar, justifyContent: "center", width: tokens.layout.size.avatar },
  cardCopy: { flex: 1, gap: tokens.spacing.xs },
  cardTitle: { ...tokens.typography.cardTitle, color: tokens.colors.textPrimary },
  cardBody: { ...tokens.typography.body, color: tokens.colors.textSecondary },
  items: { gap: tokens.spacing.sm },
  item: { alignItems: "center", flexDirection: "row", gap: tokens.spacing.md, padding: tokens.spacing.md },
  itemCopy: { flex: 1, gap: tokens.spacing.xxs },
  itemLabel: { ...tokens.typography.bodyStrong, color: tokens.colors.textPrimary },
  itemValue: { ...tokens.typography.caption, color: tokens.colors.textSecondary }
});
