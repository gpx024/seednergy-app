import { StyleSheet, Text, View } from "react-native";

import { tokens } from "@/src/ui/tokens";

export type StageBadgeTone = "active" | "success" | "attention" | "neutral";

interface StageBadgeProps {
  label: string;
  tone?: StageBadgeTone;
}

export function StageBadge({ label, tone = "active" }: StageBadgeProps) {
  return <View accessibilityLabel={label} style={[styles.base, toneStyles[tone]]}><Text style={[styles.label, labelStyles[tone]]}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  base: { alignSelf: "flex-start", paddingHorizontal: tokens.spacing.xs, paddingVertical: tokens.spacing.xxs, borderRadius: tokens.radii.pill },
  label: { ...tokens.typography.label, textTransform: "uppercase" }
});

const toneStyles = StyleSheet.create({
  active: { backgroundColor: tokens.colors.actionSecondary },
  success: { backgroundColor: tokens.colors.statusSuccessSurface },
  attention: { backgroundColor: tokens.colors.statusAttentionSurface },
  neutral: { backgroundColor: tokens.colors.surfaceMuted }
});

const labelStyles = StyleSheet.create({
  active: { color: tokens.colors.actionSecondaryText },
  success: { color: tokens.colors.statusSuccess },
  attention: { color: tokens.colors.statusAttention },
  neutral: { color: tokens.colors.textSecondary }
});
