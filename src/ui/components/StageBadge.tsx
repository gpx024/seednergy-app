import { StyleSheet, Text, View } from "react-native";

import { tokens } from "@/src/ui/tokens";

export type StageBadgeTone = "active" | "success" | "attention" | "premium" | "neutral";

interface StageBadgeProps {
  label: string;
  tone?: StageBadgeTone;
}

export function StageBadge({ label, tone = "active" }: StageBadgeProps) {
  return <View accessibilityLabel={label} style={[styles.base, toneStyles[tone]]}><Text maxFontSizeMultiplier={1.5} style={[styles.label, labelStyles[tone]]}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  base: { alignSelf: "flex-start", paddingHorizontal: 13, paddingVertical: 7, borderRadius: tokens.radii.pill },
  label: { fontFamily: "Inter_600SemiBold", fontSize: 11, lineHeight: 12, letterSpacing: 0.45, textTransform: "uppercase" }
});

const toneStyles = StyleSheet.create({
  active: { backgroundColor: tokens.colors.card, ...tokens.elevation.raisedSm },
  success: { backgroundColor: tokens.colors.olive, ...tokens.elevation.pillOlive },
  attention: { backgroundColor: tokens.colors.card, ...tokens.elevation.raisedSm },
  premium: { backgroundColor: tokens.colors.terracottaText, ...tokens.elevation.pillTerracotta },
  neutral: { backgroundColor: tokens.colors.card, ...tokens.elevation.raisedSm }
});

const labelStyles = StyleSheet.create({
  active: { color: tokens.colors.sage },
  success: { color: tokens.colors.stone },
  attention: { color: tokens.colors.alert },
  premium: { color: tokens.colors.stone },
  neutral: { color: tokens.colors.ink82 }
});
