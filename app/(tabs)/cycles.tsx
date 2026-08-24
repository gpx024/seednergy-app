import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { BrandHeader, CycleRow, ScreenContainer } from "@/src/ui/components";
import { tokens } from "@/src/ui/tokens";

const cress = require("../../assets/images/temporary/cress.png");
const pea = require("../../assets/images/temporary/pea-shoots.png");

export default function CyclesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <ScreenContainer includeBottomSafeArea={false} scroll contentStyle={styles.container}>
      <View style={styles.intro}><BrandHeader /><Text accessibilityRole="header" style={styles.title}>{t("main.myCycles")}</Text></View>
      <View accessibilityRole="tablist" style={styles.filters}><View accessibilityRole="tab" accessibilityState={{ selected: true }} style={styles.filterActiveSurface}><Text style={styles.filterActive}>{t("main.active")} (2)</Text></View><View accessibilityRole="tab" accessibilityState={{ selected: false }} style={styles.filterSurface}><Text style={styles.filter}>{t("main.completed")}</Text></View><View accessibilityRole="tab" accessibilityState={{ selected: false }} style={styles.filterSurface}><Text style={styles.filter}>{t("main.archived")}</Text></View></View>
      <View style={styles.section}><Text style={styles.label}>{t("main.growthStage")}</Text><CycleRow day={3} imageSource={cress} meta={t("main.cressCycleMeta")} name={t("stageTwo.cress")} onPress={() => router.push("/cycle/preview")} progress={0.42} status={t("main.onTrack")} /><CycleRow day={6} imageSource={pea} meta={t("main.peaCycleMeta")} name={t("stageTwo.peaShoots")} progress={0.72} status={t("main.needsCheck")} statusTone="attention" /></View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { gap: tokens.spacing.sectionGap, paddingBottom: tokens.spacing.xs },
  intro: { gap: 0 },
  title: { ...tokens.typography.displayLarge, color: tokens.colors.terracottaText },
  filters: { alignItems: "center", flexDirection: "row", gap: tokens.spacing.md },
  filterSurface: { alignItems: "center", flex: 1, justifyContent: "center", minHeight: tokens.layout.size.touchTarget },
  filterActiveSurface: { alignItems: "center", justifyContent: "center", minHeight: 34, paddingHorizontal: tokens.spacing.md, borderRadius: tokens.radii.pill, backgroundColor: tokens.colors.olive, ...tokens.elevation.pillOlive },
  filter: { fontFamily: "Inter_600SemiBold", fontSize: 13, lineHeight: 17, color: tokens.colors.oliveLabel, textAlign: "center" },
  filterActive: { fontFamily: "Inter_600SemiBold", fontSize: 13, lineHeight: 17, color: tokens.colors.stone, textAlign: "center" },
  section: { gap: 18 },
  label: { ...tokens.typography.label, color: tokens.colors.oliveLabel, textTransform: "uppercase" }
});
