import Ionicons from "@expo/vector-icons/Ionicons";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/src/ui/components/AppButton";
import { tokens } from "@/src/ui/tokens";

export type FeedbackStateKind = "empty" | "loading" | "error";

interface FeedbackStateProps {
  kind: FeedbackStateKind;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function FeedbackState({ kind, title, description, actionLabel, onAction }: FeedbackStateProps) {
  const iconName = kind === "empty" ? "time-outline" : "camera-outline";
  const iconColor = kind === "error" ? tokens.colors.alert : tokens.colors.olive;

  return (
    <View accessibilityLiveRegion="polite" style={styles.container}>
      <View style={styles.iconCircle}>{kind === "loading" ? <ActivityIndicator color={tokens.colors.olive} /> : <Ionicons color={iconColor} name={iconName} size={tokens.layout.icon.xl} />}</View>
      <Text accessibilityRole="header" maxFontSizeMultiplier={1.8} style={styles.title}>{title}</Text>
      <Text maxFontSizeMultiplier={2} style={styles.description}>{description}</Text>
      {actionLabel ? <AppButton label={actionLabel} onPress={onAction} style={styles.action} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: tokens.spacing.md, paddingHorizontal: tokens.spacing.xl, paddingVertical: tokens.spacing.xxl },
  iconCircle: { alignItems: "center", justifyContent: "center", height: 92, width: 92, borderRadius: tokens.radii.pill, backgroundColor: tokens.colors.card, ...tokens.elevation.raisedLg },
  title: { ...tokens.typography.displayMedium, color: tokens.colors.terracotta, textAlign: "center" },
  description: { ...tokens.typography.body, color: tokens.colors.ink82, textAlign: "center", maxWidth: 300 },
  action: { alignSelf: "stretch", marginTop: tokens.spacing.md }
});
