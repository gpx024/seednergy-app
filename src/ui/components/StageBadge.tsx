import { StyleSheet, Text, View } from "react-native";

import { tokens } from "@/src/ui/tokens";

export type StageBadgeTone = "active" | "success" | "attention" | "premium" | "neutral";

interface StageBadgeProps {
  label: string;
  tone?: StageBadgeTone;
}

export function StageBadge({ label, tone = "active" }: StageBadgeProps) {
  const showStatusDot = tone === "active" || tone === "attention";
  return <View accessibilityLabel={label} style={[styles.base, toneStyles[tone]]}>{showStatusDot ? <View style={[styles.dot, tone === "attention" ? styles.dotAttention : styles.dotActive]} /> : null}<Text maxFontSizeMultiplier={1.5} style={[styles.label, labelStyles[tone]]}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  base: { alignItems: "center", alignSelf: "flex-start", flexDirection: "row", gap: 6, paddingHorizontal: 13, paddingVertical: 7, borderRadius: tokens.radii.pill },
  dot: { borderRadius: 4, height: 7, width: 7 },
  dotActive: { backgroundColor: tokens.colors.olive },
  dotAttention: { backgroundColor: tokens.colors.alert },
  label: { fontFamily: "Inter_600SemiBold", fontSize: 11, lineHeight: 12, letterSpacing: 0.45, textTransform: "uppercase" }
});

const toneStyles = StyleSheet.create({
  active: { backgroundColor: tokens.colors.raised, ...tokens.elevation.raisedSm },
  success: { backgroundColor: tokens.colors.olive, ...tokens.elevation.pillOlive },
  attention: { backgroundColor: tokens.colors.card, ...tokens.elevation.raisedSm },
  premium: { backgroundColor: tokens.colors.highlight, ...tokens.elevation.pillTerracotta },
  neutral: { backgroundColor: tokens.colors.card, ...tokens.elevation.raisedSm }
});

const labelStyles = StyleSheet.create({
  active: { color: tokens.colors.olive },
  success: { color: tokens.colors.stone },
  attention: { color: tokens.colors.alert },
  premium: { color: tokens.colors.stone },
  neutral: { color: tokens.colors.ink82 }
});
