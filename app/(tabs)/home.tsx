import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppButton, AppCard, ScreenContainer, StageBadge } from "@/src/ui/components";
import { tokens } from "@/src/ui/tokens";

export default function HomeScreen() {
  const { t } = useTranslation();

  return (
    <ScreenContainer scroll contentStyle={styles.container}>
      <View style={styles.intro}>
        <Text style={styles.eyebrow}>{t("stageTwo.homeEyebrow")}</Text>
        <Text accessibilityRole="header" style={styles.title}>{t("stageTwo.homeTitle")}</Text>
        <Text style={styles.description}>{t("stageTwo.homeDescription")}</Text>
      </View>

      <AppCard style={styles.heroCard}>
        <View style={styles.heroIcon}><Ionicons color={tokens.colors.actionPrimary} name="leaf-outline" size={tokens.layout.icon.xl} /></View>
        <View style={styles.heroCopy}>
          <StageBadge label={t("stageTwo.comingSoon")} tone="neutral" />
          <Text style={styles.cardTitle}>{t("stageTwo.homeCardTitle")}</Text>
          <Text style={styles.cardBody}>{t("stageTwo.homeCardDescription")}</Text>
        </View>
      </AppCard>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("stageTwo.homeSectionTitle")}</Text>
        <AppCard variant="muted" style={styles.tipCard}>
          <Ionicons color={tokens.colors.actionPrimary} name="sunny-outline" size={tokens.layout.icon.lg} />
          <View style={styles.tipCopy}>
            <Text style={styles.tipTitle}>{t("stageTwo.homeTipTitle")}</Text>
            <Text style={styles.tipBody}>{t("stageTwo.homeTipDescription")}</Text>
          </View>
        </AppCard>
      </View>

      <AppButton disabled label={t("stageTwo.homeAction")} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { gap: tokens.spacing.xl, paddingBottom: tokens.spacing.xxxl },
  intro: { gap: tokens.spacing.sm },
  eyebrow: { ...tokens.typography.label, color: tokens.colors.textSubtle, textTransform: "uppercase" },
  title: { ...tokens.typography.display, color: tokens.colors.textPrimary },
  description: { ...tokens.typography.body, color: tokens.colors.textSecondary },
  heroCard: { alignItems: "center", flexDirection: "row", gap: tokens.spacing.lg, padding: tokens.spacing.lg },
  heroIcon: { alignItems: "center", backgroundColor: tokens.colors.actionSecondary, borderRadius: tokens.radii.pill, height: tokens.layout.size.imageSmall, justifyContent: "center", width: tokens.layout.size.imageSmall },
  heroCopy: { flex: 1, gap: tokens.spacing.xs },
  cardTitle: { ...tokens.typography.cardTitle, color: tokens.colors.textPrimary },
  cardBody: { ...tokens.typography.body, color: tokens.colors.textSecondary },
  section: { gap: tokens.spacing.md },
  sectionTitle: { ...tokens.typography.cardTitle, color: tokens.colors.textPrimary },
  tipCard: { alignItems: "flex-start", flexDirection: "row", gap: tokens.spacing.md, padding: tokens.spacing.lg },
  tipCopy: { flex: 1, gap: tokens.spacing.xxs },
  tipTitle: { ...tokens.typography.bodyStrong, color: tokens.colors.textPrimary },
  tipBody: { ...tokens.typography.caption, color: tokens.colors.textSecondary }
});
