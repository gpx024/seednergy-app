import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppButton, PhotoFrame, ScreenContainer } from "@/src/ui/components";
import { tokens } from "@/src/ui/tokens";

const cress = require("../../assets/images/temporary/cress.png");

export default function FirstCycleScreen() {
  const { t } = useTranslation();
  return <ScreenContainer contentStyle={styles.container}><PhotoFrame accessibilityLabel={t("onboarding.cressPhoto")} source={cress} style={styles.photo} /><View style={styles.copy}><Text accessibilityRole="header" style={styles.title}>{t("onboarding.firstCycleTitle")}</Text><Text style={styles.body}>{t("onboarding.firstCycleBody")}</Text></View><Link asChild href="/(onboarding)/seed-selection"><AppButton label={t("onboarding.startCress")} /></Link></ScreenContainer>;
}

const styles = StyleSheet.create({ container: { gap: tokens.spacing.xl, justifyContent: "space-between", paddingBottom: tokens.spacing.xl }, photo: { flex: 1, maxHeight: 420 }, copy: { gap: tokens.spacing.sm }, title: { ...tokens.typography.display, color: tokens.colors.terracottaText, textAlign: "center" }, body: { ...tokens.typography.body, color: tokens.colors.ink82, textAlign: "center" } });
