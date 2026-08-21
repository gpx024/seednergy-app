import { StyleSheet, Text, View } from "react-native";
import Svg, { Rect } from "react-native-svg";

import { tokens } from "@/src/ui/tokens";

interface CycleGaugeProps {
  progress: number;
  day: number;
  compact?: boolean;
  accessibilityLabel: string;
}

export function CycleGauge({ progress, day, compact = false, accessibilityLabel }: CycleGaugeProps) {
  const width = compact ? tokens.layout.size.gaugeRowWidth : tokens.layout.size.gaugeHeroWidth;
  const height = compact ? tokens.layout.size.gaugeRowHeight : tokens.layout.size.gaugeHeroHeight;
  const dash = 250;
  const safeProgress = Math.max(0, Math.min(progress, 1));

  return (
    <View accessibilityLabel={accessibilityLabel} accessibilityRole="progressbar" style={{ width, height }}>
      <Svg height="100%" viewBox="0 0 62 100" width="100%">
        <Rect fill="none" height="93" rx="27.5" stroke={tokens.colors.gaugeTrack} strokeWidth="6" width="55" x="3.5" y="3.5" />
        <Rect fill="none" height="93" rx="27.5" stroke={tokens.colors.sage} strokeDasharray={dash} strokeDashoffset={dash * (1 - safeProgress)} strokeLinecap="round" strokeWidth="6" width="55" x="3.5" y="3.5" />
      </Svg>
      <View style={styles.day}><Text maxFontSizeMultiplier={1.4} style={[styles.dayText, compact && styles.dayTextCompact]}>{day}</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  day: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  dayText: { fontFamily: "CrimsonText_600SemiBold", fontSize: 17, color: tokens.colors.forest },
  dayTextCompact: { fontSize: 14 }
});
