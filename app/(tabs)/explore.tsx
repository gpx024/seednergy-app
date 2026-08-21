import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppField, ScreenContainer, SeedCard } from "@/src/ui/components";
import { tokens } from "@/src/ui/tokens";

const cress = require("../../assets/images/temporary/cress.png");
const pea = require("../../assets/images/temporary/pea-shoots.png");
const radish = require("../../assets/images/temporary/radish-microgreens.png");
const broccoli = require("../../assets/images/temporary/broccoli-microgreens.png");

export default function ExploreScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <ScreenContainer scroll contentStyle={styles.container}>
      <View style={styles.heading}><Text style={styles.label}>{t("main.seedLibrary")}</Text><Text accessibilityRole="header" style={styles.title}>{t("main.exploreSeeds")}</Text><Text style={styles.body}>{t("main.exploreBody")}</Text></View>
      <AppField accessibilityLabel={t("main.searchSeeds")} label={t("main.searchSeeds")} placeholder={t("main.searchPlaceholder")} />
      <View style={styles.grid}>
        <SeedCard access="free" accessLabel={t("stageTwo.free")} difficulty={t("stageTwo.easy")} duration={t("onboarding.cressDuration")} imageSource={cress} name={t("stageTwo.cress")} onPress={() => router.push("/seeds/cress")} />
        <SeedCard access="locked" accessLabel={t("main.premium")} difficulty={t("stageTwo.easy")} duration={t("main.peaDuration")} imageSource={pea} name={t("stageTwo.peaShoots")} />
        <SeedCard access="locked" accessLabel={t("main.premium")} difficulty={t("stageTwo.easy")} duration={t("main.radishDuration")} imageSource={radish} name={t("stageTwo.radishMicrogreens")} />
        <SeedCard access="comingSoon" accessLabel={t("stageTwo.comingSoon")} difficulty={t("stageTwo.easy")} duration={t("main.broccoliDuration")} imageSource={broccoli} name={t("stageTwo.broccoliMicrogreens")} />
      </View>
      <View style={styles.note}><Ionicons color={tokens.colors.oliveLabel} name="information-circle-outline" size={tokens.layout.icon.md} /><Text style={styles.noteText}>{t("main.catalogueNote")}</Text></View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { gap: tokens.spacing.sectionGap, paddingBottom: tokens.spacing.xl },
  heading: { gap: tokens.spacing.xs },
  label: { ...tokens.typography.label, color: tokens.colors.oliveLabel, textTransform: "uppercase" },
  title: { ...tokens.typography.display, color: tokens.colors.terracotta },
  body: { ...tokens.typography.body, color: tokens.colors.ink82 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing.cardGap },
  note: { alignItems: "center", flexDirection: "row", gap: tokens.spacing.xs },
  noteText: { ...tokens.typography.caption, color: tokens.colors.ink64, flex: 1 }
});
