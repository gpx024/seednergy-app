import { StyleSheet, Text, View } from "react-native";

import { tokens } from "@/src/ui/tokens";

export type StageBadgeTone = "active" | "success" | "attention" | "neutral";

interface StageBadgeProps {
  label: string;
  tone?: StageBadgeTone;
}

export function StageBadge({ label, tone = "active" }: StageBadgeProps) {
  return <View accessibilityLabel={label} style={[styles.base, toneStyles[tone]]}><Text maxFontSizeMultiplier={1.5} style={[styles.label, labelStyles[tone]]}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  base: { alignSelf: "flex-start", paddingHorizontal: 13, paddingVertical: 7, borderRadius: tokens.radii.pill },
  label: { fontFamily: "Inter_600SemiBold", fontSize: 11, lineHeight: 12, fontWeight: "600", letterSpacing: 0.45, textTransform: "uppercase" }
});

const toneStyles = StyleSheet.create({
  active: { backgroundColor: tokens.colors.forest, ...tokens.elevation.pillForest },
  success: { backgroundColor: tokens.colors.olive, ...tokens.elevation.pillOlive },
  attention: { backgroundColor: tokens.colors.alert, ...tokens.elevation.pillAlert },
  neutral: { backgroundColor: tokens.colors.card, ...tokens.elevation.raisedSm }
});

const labelStyles = StyleSheet.create({
  active: { color: tokens.colors.canvas },
  success: { color: tokens.colors.stone },
  attention: { color: tokens.colors.stone },
  neutral: { color: tokens.colors.ink82 }
});
