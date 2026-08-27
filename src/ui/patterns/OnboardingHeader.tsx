import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { tokens } from "@/src/ui/tokens";

interface OnboardingHeaderProps {
  step?: number;
  totalSteps?: number;
}

export function OnboardingHeader({ step, totalSteps = 4 }: OnboardingHeaderProps) {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Back" accessibilityRole="button" hitSlop={12} onPress={() => router.back()} style={styles.back}><Ionicons color={tokens.colors.ink} name="arrow-back" size={tokens.layout.icon.lg} /></Pressable>
        {step ? <View style={styles.progress}><View style={styles.dots}>{Array.from({ length: totalSteps }, (_, index) => <View key={index} style={[styles.dot, index < step && styles.dotActive]} />)}</View><Text style={styles.step}>Step {step}/{totalSteps}</Text></View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 0 },
  header: { alignItems: "center", flexDirection: "row", minHeight: tokens.layout.size.touchTarget, justifyContent: "space-between" },
  back: { alignItems: "center", justifyContent: "center", minHeight: tokens.layout.size.touchTarget, minWidth: tokens.layout.size.touchTarget },
  progress: { alignItems: "center", flexDirection: "row", gap: tokens.spacing.sm },
  dots: { flexDirection: "row", gap: tokens.spacing.xxs },
  dot: { height: 3, width: 24, borderRadius: tokens.radii.pill, backgroundColor: tokens.colors.gaugeTrack },
  dotActive: { backgroundColor: tokens.colors.olive },
  step: { ...tokens.typography.label, color: tokens.colors.oliveLabel, textTransform: "uppercase" }
});
