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
  const iconName = kind === "empty" ? "leaf-outline" : "camera-outline";
  const iconColor = kind === "error" ? tokens.colors.statusAttention : tokens.colors.actionPrimary;

  return (
    <View accessibilityLiveRegion="polite" style={styles.container}>
      <View style={[styles.iconCircle, kind === "error" && styles.iconCircleAttention]}>
        {kind === "loading" ? <ActivityIndicator color={tokens.colors.actionPrimary} /> : <Ionicons color={iconColor} name={iconName} size={tokens.layout.icon.xl} />}
      </View>
      <Text accessibilityRole="header" style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel ? <AppButton label={actionLabel} onPress={onAction} style={styles.action} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: tokens.spacing.md, paddingHorizontal: tokens.spacing.xxl, paddingVertical: tokens.spacing.xxxl },
  iconCircle: { alignItems: "center", justifyContent: "center", height: tokens.layout.size.imageLarge, width: tokens.layout.size.imageLarge, borderColor: tokens.colors.border, borderRadius: tokens.radii.pill, borderWidth: tokens.layout.border.standard, backgroundColor: tokens.colors.surface, ...tokens.elevation.floating },
  iconCircleAttention: { backgroundColor: tokens.colors.statusAttentionSurface },
  title: { ...tokens.typography.title, color: tokens.colors.textPrimary, textAlign: "center" },
  description: { ...tokens.typography.body, color: tokens.colors.textSecondary, textAlign: "center" },
  action: { alignSelf: "stretch", marginTop: tokens.spacing.md }
});
