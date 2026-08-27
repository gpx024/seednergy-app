import { StyleSheet, Text, View } from "react-native";

import { BackHeader } from "@/src/ui/components/BackHeader";
import { tokens } from "@/src/ui/tokens";

interface OnboardingHeaderProps {
  step?: number;
  totalSteps?: number;
}

export function OnboardingHeader({ step, totalSteps = 4 }: OnboardingHeaderProps) {
  const progress = step ? <View style={styles.progress}><View style={styles.dots}>{Array.from({ length: totalSteps }, (_, index) => <View key={index} style={[styles.dot, index < step && styles.dotActive]} />)}</View><Text style={styles.step}>Step {step}/{totalSteps}</Text></View> : undefined;
  return <View style={styles.container}><BackHeader center={progress} /></View>;
}

const styles = StyleSheet.create({
  container: { gap: 0 },
  progress: { alignItems: "center", flexDirection: "row", gap: tokens.spacing.sm },
  dots: { flexDirection: "row", gap: tokens.spacing.xxs },
  dot: { height: 3, width: 24, borderRadius: tokens.radii.pill, backgroundColor: tokens.colors.gaugeTrack },
  dotActive: { backgroundColor: tokens.colors.olive },
  step: { ...tokens.typography.label, color: tokens.colors.oliveLabel, textTransform: "uppercase" }
});
