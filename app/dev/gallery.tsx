import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppButton, AppCard, CycleProgress, FeedbackState, ScreenContainer, SeedCard, StageBadge } from "@/src/ui/components";
import { tokens } from "@/src/ui/tokens";

export default function ComponentGalleryScreen() {
  const { t } = useTranslation();

  return (
    <ScreenContainer scroll contentStyle={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>{t("gallery.galleryTitle")}</Text>
      <Text style={styles.description}>{t("gallery.galleryDescription")}</Text>

      <GallerySection title={t("gallery.componentTitle")}>
        <AppButton label={t("gallery.primaryAction")} />
        <AppButton label={t("gallery.secondaryAction")} variant="secondary" />
        <AppButton label={t("gallery.secondaryAction")} variant="ghost" />
      </GallerySection>

      <GallerySection title={t("gallery.componentCard")}>
        <AppCard style={styles.card}><Text style={styles.cardTitle}>{t("gallery.cardTitle")}</Text><Text style={styles.cardBody}>{t("gallery.cardBody")}</Text></AppCard>
        <AppCard variant="dashed" style={styles.card}><Text style={styles.cardBody}>{t("gallery.cardBody")}</Text></AppCard>
      </GallerySection>

      <GallerySection title={t("gallery.componentProgress")}>
        <CycleProgress accessibilityLabel={t("gallery.progressDescription")} activeStep={1} labels={[t("gallery.setup"), t("gallery.stageGrowth"), t("gallery.success")]} />
      </GallerySection>

      <GallerySection title={t("gallery.componentStates")}>
        <View style={styles.badges}><StageBadge label={t("gallery.stageGrowth")} /><StageBadge label={t("gallery.success")} tone="success" /><StageBadge label={t("gallery.attention")} tone="attention" /><StageBadge label={t("gallery.locked")} tone="neutral" /></View>
      </GallerySection>

      <GallerySection title={t("gallery.componentSeed")}>
        <SeedCard access="free" accessLabel={t("gallery.free")} difficulty={t("gallery.seedDifficulty")} duration={t("gallery.seedDuration")} name={t("gallery.seedName")} />
      </GallerySection>

      <GallerySection title={t("gallery.componentFeedback")}>
        <FeedbackState description={t("gallery.emptyDescription")} kind="empty" title={t("gallery.emptyTitle")} />
        <FeedbackState description={t("gallery.loadingDescription")} kind="loading" title={t("gallery.loadingTitle")} />
        <FeedbackState actionLabel={t("gallery.tryAgain")} description={t("gallery.errorDescription")} kind="error" title={t("gallery.errorTitle")} />
      </GallerySection>
    </ScreenContainer>
  );
}

function GallerySection({ title, children }: { title: string; children: React.ReactNode }) {
  return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text><View style={styles.sectionContent}>{children}</View></View>;
}

const styles = StyleSheet.create({
  container: { gap: tokens.spacing.xl },
  title: { ...tokens.typography.title, color: tokens.colors.textPrimary },
  description: { ...tokens.typography.body, color: tokens.colors.textSecondary },
  section: { gap: tokens.spacing.md },
  sectionTitle: { ...tokens.typography.label, color: tokens.colors.textSubtle, textTransform: "uppercase" },
  sectionContent: { gap: tokens.spacing.sm },
  card: { gap: tokens.spacing.xs, padding: tokens.spacing.lg },
  cardTitle: { ...tokens.typography.cardTitle, color: tokens.colors.textPrimary },
  cardBody: { ...tokens.typography.body, color: tokens.colors.textSecondary },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing.xs }
});
