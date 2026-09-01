import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppButton, AppCard, AppField, BrandMark, CycleGauge, CycleProgress, FeedbackState, OptionRow, PhotoFrame, ProcessIcon, ScreenContainer, SeedCard, StageBadge } from "@/src/ui/components";
import { tokens } from "@/src/ui/tokens";

const cress = require("../../assets/images/temporary/cress.png");

export default function ComponentGalleryScreen() {
  const { t } = useTranslation();
  return (
    <ScreenContainer scroll contentStyle={styles.container}>
      <View style={styles.brand}><BrandMark width={28} /><View><Text accessibilityRole="header" style={styles.title}>{t("gallery.galleryTitle")}</Text><Text style={styles.description}>{t("gallery.galleryDescription")}</Text></View></View>
      <GallerySection title={t("gallery.componentTitle")}><AppButton label={t("gallery.primaryAction")} /><AppButton label={t("gallery.secondaryAction")} variant="secondary" /><AppButton label={t("gallery.secondaryAction")} variant="text" /></GallerySection>
      <GallerySection title={t("gallery.componentCard")}><AppCard style={styles.card}><Text style={styles.cardTitle}>{t("gallery.cardTitle")}</Text><Text style={styles.cardBody}>{t("gallery.cardBody")}</Text><AppCard variant="nested"><Text style={styles.nestedTitle}>{t("main.nextAction")}</Text><Text style={styles.nestedBody}>{t("main.coachBody")}</Text></AppCard></AppCard></GallerySection>
      <GallerySection title={t("gallery.componentProgress")}><View style={styles.gauges}><CycleGauge accessibilityLabel="Day 3, 42 percent" day={3} progress={0.42} /><CycleGauge accessibilityLabel="Day 6, 72 percent" compact day={6} progress={0.72} /></View><CycleProgress accessibilityLabel={t("gallery.progressDescription")} activeStep={1} labels={[t("gallery.setup"), t("gallery.stageGrowth"), t("gallery.success")]} /></GallerySection>
      <GallerySection title={t("gallery.componentStates")}><View style={styles.badges}><StageBadge label={t("gallery.stageGrowth")} /><StageBadge label={t("gallery.success")} tone="success" /><StageBadge label={t("gallery.attention")} tone="attention" /><StageBadge label={t("gallery.locked")} tone="neutral" /></View></GallerySection>
      <GallerySection title={t("gallery.componentSeed")}><SeedCard access="free" accessLabel={t("gallery.free")} difficulty={t("gallery.seedDifficulty")} duration={t("onboarding.cressDuration")} imageSource={cress} name={t("gallery.seedName")} /></GallerySection>
      <GallerySection title={t("gallery.forms")}><AppField label={t("onboarding.email")} placeholder="hello@example.com" /><OptionRow description={t("onboarding.indoorBody")} icon="home-outline" selected title={t("onboarding.indoor")} /></GallerySection>
      <GallerySection title={t("gallery.photography")}><PhotoFrame accessibilityLabel={t("onboarding.cressPhoto")} source={cress} style={styles.photo} /></GallerySection>
      <GallerySection title="Growth-stage artwork"><View style={styles.processRow}>{(["seed", "germination", "seedling", "grown"] as const).map((stage) => <ProcessIcon key={stage} stage={stage} />)}</View></GallerySection>
      <GallerySection title={t("gallery.componentFeedback")}><FeedbackState description={t("gallery.emptyDescription")} kind="empty" title={t("gallery.emptyTitle")} /><FeedbackState description={t("gallery.loadingDescription")} kind="loading" title={t("gallery.loadingTitle")} /><FeedbackState actionLabel={t("gallery.tryAgain")} description={t("gallery.errorDescription")} kind="error" title={t("gallery.errorTitle")} /></GallerySection>
    </ScreenContainer>
  );
}

function GallerySection({ title, children }: { title: string; children: React.ReactNode }) { return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text><View style={styles.sectionContent}>{children}</View></View>; }
const styles = StyleSheet.create({ container: { gap: tokens.spacing.xxl, paddingBottom: tokens.spacing.xxxl }, brand: { alignItems: "center", flexDirection: "row", gap: tokens.spacing.md }, title: { ...tokens.typography.display, color: tokens.colors.terracottaText }, description: { ...tokens.typography.body, color: tokens.colors.ink82 }, section: { gap: tokens.spacing.md }, sectionTitle: { ...tokens.typography.label, color: tokens.colors.oliveLabel, textTransform: "uppercase" }, sectionContent: { gap: tokens.spacing.cardGap }, card: { gap: tokens.spacing.md }, cardTitle: { ...tokens.typography.name, color: tokens.colors.forest }, cardBody: { ...tokens.typography.body, color: tokens.colors.ink82 }, nestedTitle: { ...tokens.typography.panelHeadline, color: tokens.colors.coachLabel }, nestedBody: { ...tokens.typography.body, color: tokens.colors.raised, marginTop: tokens.spacing.xs }, gauges: { alignItems: "center", flexDirection: "row", gap: tokens.spacing.xl }, badges: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing.cardGap }, photo: { height: 260 }, processRow: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing.md } });
