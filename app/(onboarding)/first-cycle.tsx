import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppButton, AppCard, BrandHeader, PhotoFrame, ScreenContainer, StageBadge } from "@/src/ui/components";
import { tokens } from "@/src/ui/tokens";

const cress = require("../../assets/images/temporary/cress.png");

export default function FirstCycleScreen() {
  const { t } = useTranslation();
  return (
    <ScreenContainer scroll contentStyle={styles.container}>
      <BrandHeader />
      <Text accessibilityRole="header" style={styles.title}>{t("onboarding.firstCycleTitle")}</Text>
      <PhotoFrame accessibilityLabel={t("onboarding.cressPhoto")} source={cress} style={styles.photo} />
      <View style={styles.seedHeading}><View><Text style={styles.seedName}>{t("stageTwo.cress")}</Text><Text style={styles.scientificName}>Lepidium sativum</Text></View><StageBadge label={t("stageTwo.free")} tone="premium" /></View>
      <Text style={[styles.body, styles.textInset]}>{t("onboarding.firstCycleBody")}</Text>
      <View style={[styles.details, styles.textInset]}><Detail label={t("onboarding.estimatedTime")} value={t("onboarding.cressDuration")} /><Detail label={t("onboarding.difficulty")} value={t("stageTwo.easy")} /><Detail label={t("onboarding.environment")} value={t("onboarding.anySpace")} /></View>
      <AppCard style={styles.next}><Text style={styles.nextLabel}>{t("onboarding.whatNext")}</Text><Text style={styles.nextTitle}>{t("onboarding.firstAction")}</Text><Text style={styles.body}>{t("onboarding.nextSteps")}</Text></AppCard>
      <Link asChild href="/(onboarding)/notifications"><AppButton label={t("onboarding.startCycle")} /></Link>
    </ScreenContainer>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <View style={styles.detail}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  container: { gap: tokens.spacing.md, paddingBottom: tokens.spacing.md },
  title: { ...tokens.typography.displayLarge, color: tokens.colors.terracottaText, marginHorizontal: tokens.spacing.md, marginTop: tokens.spacing.lg },
  body: { ...tokens.typography.body, color: tokens.colors.ink82 },
  photo: { aspectRatio: 16 / 10, height: undefined },
  seedHeading: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginHorizontal: tokens.spacing.md },
  seedName: { ...tokens.typography.cardTitle, color: tokens.colors.forest },
  scientificName: { ...tokens.typography.caption, color: tokens.colors.ink64 },
  details: { alignItems: "flex-start", flexDirection: "row", gap: tokens.spacing.cardGap },
  detail: { flex: 1, gap: tokens.spacing.xxs },
  detailLabel: { ...tokens.typography.label, color: tokens.colors.sage, minHeight: 28, textTransform: "uppercase" },
  detailValue: { ...tokens.typography.panelHeadline, color: tokens.colors.forest },
  textInset: { marginHorizontal: tokens.spacing.md },
  next: { gap: tokens.spacing.xs },
  nextLabel: { ...tokens.typography.label, color: tokens.colors.oliveLabel, textTransform: "uppercase" },
  nextTitle: { ...tokens.typography.title, color: tokens.colors.forest }
});
