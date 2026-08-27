import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppButton, AppCard, BackHeader, ScreenContainer } from "@/src/ui/components";
import { tokens } from "@/src/ui/tokens";

const options = [
  { labelKey: "paywall.singleSeed", price: "$2.99" },
  { labelKey: "paywall.monthly", price: "$5.99" },
  { labelKey: "paywall.yearly", price: "$49.99" }
] as const;

export default function PaywallScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  return <ScreenContainer scroll contentStyle={styles.container}>
    <BackHeader />
    <View style={styles.heading}><Text style={styles.eyebrow}>{t("paywall.eyebrow")}</Text><Text accessibilityRole="header" style={styles.title}>{t("paywall.title")}</Text><Text style={styles.body}>{t("paywall.body")}</Text></View>
    <AppCard variant="nested" style={styles.benefits}><Benefit text={t("paywall.benefitSeeds")} /><Benefit text={t("paywall.benefitChecks")} /><Benefit text={t("paywall.benefitCycles")} /></AppCard>
    <View style={styles.options}>{options.map((option) => <AppCard key={option.labelKey} style={styles.option}><Text style={styles.optionTitle}>{t(option.labelKey)}</Text><Text style={styles.price}>{option.price}</Text></AppCard>)}</View>
    <AppButton disabled label={t("paywall.commercialAction")} />
    <Text accessibilityLiveRegion="polite" style={styles.note}>{t("paywall.privateBuildNote")}</Text>
    <AppButton label={t("paywall.keepExploring")} onPress={() => router.replace("/(tabs)/explore")} variant="text" />
  </ScreenContainer>;
}

function Benefit({ text }: { text: string }) { return <View style={styles.benefit}><Ionicons color={tokens.colors.coachLabel} name="checkmark-circle" size={22} /><Text style={styles.benefitText}>{text}</Text></View>; }

const styles = StyleSheet.create({
  container: { gap: tokens.spacing.lg, paddingBottom: tokens.spacing.xxl },
  heading: { gap: tokens.spacing.xs, marginHorizontal: tokens.spacing.md },
  eyebrow: { ...tokens.typography.label, color: tokens.colors.oliveLabel, textTransform: "uppercase" },
  title: { ...tokens.typography.displayLarge, color: tokens.colors.terracottaText },
  body: { ...tokens.typography.body, color: tokens.colors.ink82 },
  benefits: { gap: tokens.spacing.sm },
  benefit: { alignItems: "center", flexDirection: "row", gap: tokens.spacing.sm },
  benefitText: { ...tokens.typography.bodyStrong, color: tokens.colors.raised, flex: 1 },
  options: { gap: tokens.spacing.cardGap },
  option: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  optionTitle: { ...tokens.typography.cardTitle, color: tokens.colors.forest },
  price: { ...tokens.typography.title, color: tokens.colors.sage },
  note: { ...tokens.typography.caption, color: tokens.colors.ink64, marginHorizontal: tokens.spacing.md, textAlign: "center" }
});
