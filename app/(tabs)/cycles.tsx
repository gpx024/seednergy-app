import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { FeedbackState, ScreenContainer } from "@/src/ui/components";
import { tokens } from "@/src/ui/tokens";

export default function CyclesScreen() {
  const { t } = useTranslation();

  return (
    <ScreenContainer contentStyle={styles.container}>
      <View style={styles.intro}>
        <Text style={styles.eyebrow}>{t("stageTwo.cyclesEyebrow")}</Text>
        <Text accessibilityRole="header" style={styles.title}>{t("stageTwo.cyclesTitle")}</Text>
        <Text style={styles.description}>{t("stageTwo.cyclesDescription")}</Text>
      </View>
      <FeedbackState description={t("stageTwo.cyclesEmptyDescription")} kind="empty" title={t("stageTwo.cyclesEmptyTitle")} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: "space-between", paddingBottom: tokens.spacing.xxxl },
  intro: { gap: tokens.spacing.sm },
  eyebrow: { ...tokens.typography.label, color: tokens.colors.textSubtle, textTransform: "uppercase" },
  title: { ...tokens.typography.display, color: tokens.colors.textPrimary },
  description: { ...tokens.typography.body, color: tokens.colors.textSecondary }
});
