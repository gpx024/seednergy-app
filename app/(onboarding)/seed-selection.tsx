import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppButton, AppCard, PhotoFrame, ScreenContainer, StageBadge } from "@/src/ui/components";
import { OnboardingHeader } from "@/src/ui/patterns/OnboardingHeader";
import { tokens } from "@/src/ui/tokens";

const cress = require("../../assets/images/temporary/cress.png");

export default function SeedSelectionScreen() {
  const { t } = useTranslation();
  return <ScreenContainer scroll contentStyle={styles.container}><OnboardingHeader /><View style={styles.heading}><Text style={styles.eyebrow}>{t("onboarding.firstSeed")}</Text><Text accessibilityRole="header" style={styles.title}>{t("stageTwo.cress")}</Text></View><PhotoFrame accessibilityLabel={t("onboarding.cressPhoto")} source={cress} style={styles.photo} /><View style={styles.meta}><StageBadge label={t("stageTwo.free")} tone="success" /><Text style={styles.duration}>{t("onboarding.cressDuration")}</Text></View><Text style={styles.body}>{t("onboarding.cressDescription")}</Text><AppCard variant="muted" style={styles.details}><View><Text style={styles.label}>{t("onboarding.difficulty")}</Text><Text style={styles.value}>{t("stageTwo.easy")}</Text></View><View><Text style={styles.label}>{t("onboarding.environment")}</Text><Text style={styles.value}>{t("onboarding.anySpace")}</Text></View></AppCard><Link asChild href="/(onboarding)/ready"><AppButton label={t("onboarding.startCycle")} /></Link></ScreenContainer>;
}

const styles = StyleSheet.create({ container: { gap: tokens.spacing.lg, paddingBottom: tokens.spacing.xl }, heading: { gap: tokens.spacing.xxs }, eyebrow: { ...tokens.typography.label, color: tokens.colors.oliveLabel, textTransform: "uppercase" }, title: { ...tokens.typography.display, color: tokens.colors.terracotta }, photo: { height: 280 }, meta: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }, duration: { ...tokens.typography.caption, color: tokens.colors.ink64 }, body: { ...tokens.typography.body, color: tokens.colors.ink82 }, details: { flexDirection: "row", justifyContent: "space-around" }, label: { ...tokens.typography.label, color: tokens.colors.oliveLabel, textTransform: "uppercase" }, value: { ...tokens.typography.title, color: tokens.colors.forest, marginTop: tokens.spacing.xxs } });
