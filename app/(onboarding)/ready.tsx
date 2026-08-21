import Ionicons from "@expo/vector-icons/Ionicons";
import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppButton, AppCard, ScreenContainer } from "@/src/ui/components";
import { OnboardingHeader } from "@/src/ui/patterns/OnboardingHeader";
import { tokens } from "@/src/ui/tokens";

export default function ReadyScreen() {
  const { t } = useTranslation();
  return <ScreenContainer contentStyle={styles.container}><OnboardingHeader /><View style={styles.check}><Ionicons color={tokens.colors.olive} name="checkmark" size={tokens.layout.icon.xl} /></View><View style={styles.copy}><Text accessibilityRole="header" style={styles.title}>{t("onboarding.readyTitle")}</Text><Text style={styles.body}>{t("onboarding.readyBody")}</Text></View><AppCard style={styles.summary}><SummaryRow label={t("onboarding.selectedSeed")} value={t("stageTwo.cress")} /><SummaryRow label={t("onboarding.estimatedTime")} value={t("onboarding.cressDuration")} /><Text style={styles.label}>{t("onboarding.whatNext")}</Text><Text style={styles.body}>{t("onboarding.nextSteps")}</Text></AppCard><Link asChild href="/(onboarding)/notifications"><AppButton label={t("onboarding.startCycle")} /></Link></ScreenContainer>;
}

function SummaryRow({ label, value }: { label: string; value: string }) { return <View style={styles.row}><Text style={styles.body}>{label}</Text><Text style={styles.value}>{value}</Text></View>; }
const styles = StyleSheet.create({ container: { gap: tokens.spacing.xl, paddingBottom: tokens.spacing.xl }, check: { alignItems: "center", alignSelf: "center", justifyContent: "center", height: 68, width: 68, borderRadius: tokens.radii.pill, backgroundColor: tokens.colors.card, ...tokens.elevation.raisedLg }, copy: { alignItems: "center", gap: tokens.spacing.sm }, title: { ...tokens.typography.display, color: tokens.colors.terracotta }, body: { ...tokens.typography.body, color: tokens.colors.ink82 }, summary: { gap: tokens.spacing.md }, row: { flexDirection: "row", justifyContent: "space-between" }, value: { ...tokens.typography.bodyStrong, color: tokens.colors.forest }, label: { ...tokens.typography.label, color: tokens.colors.oliveLabel, marginTop: tokens.spacing.sm, textTransform: "uppercase" } });
