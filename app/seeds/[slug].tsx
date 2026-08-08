import Ionicons from "@expo/vector-icons/Ionicons";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppButton, AppCard, ScreenContainer, StageBadge } from "@/src/ui/components";
import { tokens } from "@/src/ui/tokens";

export default function SeedDetailScreen() {
  const { t } = useTranslation();

  return (
    <ScreenContainer scroll contentStyle={styles.container}>
      <Link asChild href="/explore">
        <Pressable accessibilityLabel={t("stageTwo.backToExplore")} accessibilityRole="button" style={styles.backButton}>
          <Ionicons color={tokens.colors.textPrimary} name="arrow-back" size={tokens.layout.icon.lg} />
          <Text style={styles.backLabel}>{t("stageTwo.backToExplore")}</Text>
        </Pressable>
      </Link>

      <View style={styles.hero}>
        <View style={styles.heroIcon}><Ionicons color={tokens.colors.actionPrimary} name="leaf-outline" size={tokens.layout.icon.xl} /></View>
        <StageBadge label={t("stageTwo.free")} />
      </View>

      <View style={styles.intro}>
        <Text style={styles.eyebrow}>{t("stageTwo.seedPreviewEyebrow")}</Text>
        <Text accessibilityRole="header" style={styles.title}>{t("stageTwo.cress")}</Text>
        <Text style={styles.description}>{t("stageTwo.seedPreviewDescription")}</Text>
      </View>

      <View style={styles.meta}>
        <MetaItem icon="time-outline" label={t("stageTwo.seedPreviewDuration")} value={t("stageTwo.cressDuration")} />
        <MetaItem icon="sparkles-outline" label={t("stageTwo.seedPreviewDifficulty")} value={t("stageTwo.easy")} />
      </View>

      <AppCard variant="muted" style={styles.guideCard}>
        <Ionicons color={tokens.colors.actionPrimary} name="book-outline" size={tokens.layout.icon.lg} />
        <View style={styles.guideCopy}>
          <Text style={styles.guideTitle}>{t("stageTwo.seedPreviewGuideTitle")}</Text>
          <Text style={styles.guideBody}>{t("stageTwo.seedPreviewGuideDescription")}</Text>
        </View>
      </AppCard>

      <AppButton disabled label={t("stageTwo.seedPreviewAction")} />
    </ScreenContainer>
  );
}

function MetaItem({ icon, label, value }: { icon: "time-outline" | "sparkles-outline"; label: string; value: string }) {
  return (
    <AppCard variant="muted" style={styles.metaItem}>
      <Ionicons color={tokens.colors.actionPrimary} name={icon} size={tokens.layout.icon.lg} />
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  container: { gap: tokens.spacing.xl, paddingBottom: tokens.spacing.xxxl },
  backButton: { alignItems: "center", alignSelf: "flex-start", flexDirection: "row", gap: tokens.spacing.xs, minHeight: tokens.layout.size.touchTarget },
  backLabel: { ...tokens.typography.bodyStrong, color: tokens.colors.textPrimary },
  hero: { alignItems: "center", gap: tokens.spacing.md },
  heroIcon: { alignItems: "center", backgroundColor: tokens.colors.actionSecondary, borderRadius: tokens.radii.pill, height: tokens.layout.size.imageLarge, justifyContent: "center", width: tokens.layout.size.imageLarge },
  intro: { gap: tokens.spacing.sm },
  eyebrow: { ...tokens.typography.label, color: tokens.colors.textSubtle, textTransform: "uppercase" },
  title: { ...tokens.typography.display, color: tokens.colors.textPrimary },
  description: { ...tokens.typography.body, color: tokens.colors.textSecondary },
  meta: { flexDirection: "row", gap: tokens.spacing.sm },
  metaItem: { flex: 1, gap: tokens.spacing.xs, padding: tokens.spacing.md },
  metaLabel: { ...tokens.typography.caption, color: tokens.colors.textSecondary },
  metaValue: { ...tokens.typography.bodyStrong, color: tokens.colors.textPrimary },
  guideCard: { alignItems: "flex-start", flexDirection: "row", gap: tokens.spacing.md, padding: tokens.spacing.lg },
  guideCopy: { flex: 1, gap: tokens.spacing.xxs },
  guideTitle: { ...tokens.typography.bodyStrong, color: tokens.colors.textPrimary },
  guideBody: { ...tokens.typography.caption, color: tokens.colors.textSecondary }
});
