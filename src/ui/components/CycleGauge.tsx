import { StyleSheet, Text, View } from "react-native";
import Svg, { Rect } from "react-native-svg";

import { tokens } from "@/src/ui/tokens";

interface CycleGaugeProps {
  progress: number;
  day: number;
  totalDays?: number;
  compact?: boolean;
  accessibilityLabel: string;
}

export function CycleGauge({ progress, day, totalDays, compact = false, accessibilityLabel }: CycleGaugeProps) {
  const width = compact ? tokens.layout.size.gaugeRowWidth : tokens.layout.size.gaugeHeroWidth;
  const height = compact ? tokens.layout.size.gaugeRowHeight : tokens.layout.size.gaugeHeroHeight;
  const dash = 250;
  const safeProgress = Math.max(0, Math.min(progress, 1));

  return (
    <View accessibilityLabel={accessibilityLabel} accessibilityRole="progressbar" style={{ width, height }}>
      <Svg height="100%" viewBox="0 0 62 100" width="100%">
        <Rect fill="none" height="93" rx="27.5" stroke={tokens.colors.track} strokeWidth="6" width="55" x="3.5" y="3.5" />
        <Rect fill="none" height="93" rx="27.5" stroke={tokens.colors.olive} strokeDasharray={dash} strokeDashoffset={dash * (1 - safeProgress)} strokeLinecap="round" strokeWidth="6" width="55" x="3.5" y="3.5" />
      </Svg>
      <View style={styles.day}><Text maxFontSizeMultiplier={1.4} style={[styles.dayText, compact && styles.dayTextCompact]}>{day}</Text>{totalDays && !compact ? <Text style={styles.total}>of {totalDays}</Text> : null}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  day: { ...StyleSheet.absoluteFillObject, alignItems: "center", gap: 1, justifyContent: "center" },
  dayText: { fontFamily: "CrimsonText_600SemiBold", fontSize: 16, color: tokens.colors.seed },
  dayTextCompact: { fontSize: 14 },
  total: { fontFamily: "Inter_600SemiBold", fontSize: 7, lineHeight: 9, color: tokens.colors.progressText, textTransform: "uppercase" }
});
