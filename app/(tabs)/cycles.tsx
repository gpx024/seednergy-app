import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppCard, CycleRow, ScreenContainer } from "@/src/ui/components";
import { tokens } from "@/src/ui/tokens";

const cress = require("../../assets/images/temporary/cress.png");
const pea = require("../../assets/images/temporary/pea-shoots.png");

export default function CyclesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <ScreenContainer scroll contentStyle={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>{t("main.myCycles")}</Text>
      <AppCard variant="muted" style={styles.filters}><Text style={styles.filterActive}>{t("main.active")}</Text><Text style={styles.filter}>{t("main.completed")}</Text><Text style={styles.filter}>{t("main.archived")}</Text></AppCard>
      <View style={styles.section}><Text style={styles.label}>{t("main.growthStage")}</Text><CycleRow day={3} imageSource={cress} meta={t("main.cressCycleMeta")} name={t("stageTwo.cress")} onPress={() => router.push("/cycle/preview")} progress={0.42} status={t("main.onTrack")} /><CycleRow day={6} imageSource={pea} meta={t("main.peaCycleMeta")} name={t("stageTwo.peaShoots")} progress={0.72} status={t("main.needsCheck")} statusTone="attention" /></View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { gap: tokens.spacing.sectionGap, paddingBottom: tokens.spacing.xl },
  title: { ...tokens.typography.display, color: tokens.colors.terracottaText },
  filters: { flexDirection: "row", padding: 5 },
  filter: { ...tokens.typography.tab, color: tokens.colors.oliveLabel, flex: 1, paddingVertical: 11, textAlign: "center", textTransform: "uppercase" },
  filterActive: { ...tokens.typography.tab, color: tokens.colors.canvas, flex: 1, paddingVertical: 11, textAlign: "center", textTransform: "uppercase", borderRadius: 11, backgroundColor: tokens.colors.forest },
  section: { gap: tokens.spacing.cardGap },
  label: { ...tokens.typography.label, color: tokens.colors.oliveLabel, textTransform: "uppercase" }
});
