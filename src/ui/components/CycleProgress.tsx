import { StyleSheet, Text, View } from "react-native";

import { tokens } from "@/src/ui/tokens";

interface CycleProgressProps {
  labels: readonly string[];
  activeStep: number;
  accessibilityLabel: string;
}

export function CycleProgress({ labels, activeStep, accessibilityLabel }: CycleProgressProps) {
  return (
    <View accessibilityLabel={accessibilityLabel} accessibilityRole="progressbar">
      <View style={styles.segments}>{labels.map((label, index) => <View key={label} style={[styles.segment, index <= activeStep && styles.segmentActive]} />)}</View>
      <View style={styles.labels}>{labels.map((label) => <Text key={label} style={styles.label}>{label}</Text>)}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  segments: { flexDirection: "row", gap: tokens.spacing.xs },
  segment: { flex: 1, height: tokens.spacing.xxs, borderRadius: tokens.radii.pill, backgroundColor: tokens.colors.border },
  segmentActive: { backgroundColor: tokens.colors.actionPrimary },
  labels: { flexDirection: "row", justifyContent: "space-between", marginTop: tokens.spacing.xs },
  label: { ...tokens.typography.label, color: tokens.colors.textSubtle, textTransform: "uppercase" }
});
