import { type PropsWithChildren } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { tokens } from "@/src/ui/tokens";

type AppCardVariant = "default" | "muted" | "dashed";

interface AppCardProps extends PropsWithChildren {
  variant?: AppCardVariant;
  style?: StyleProp<ViewStyle>;
}

export function AppCard({ children, variant = "default", style }: AppCardProps) {
  return <View style={[styles.base, variantStyles[variant], style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: { borderRadius: tokens.radii.feature, borderColor: tokens.colors.border, borderWidth: tokens.layout.border.standard, overflow: "hidden" }
});

const variantStyles = StyleSheet.create({
  default: { backgroundColor: tokens.colors.surface, ...tokens.elevation.card },
  muted: { backgroundColor: tokens.colors.background, borderColor: tokens.colors.borderSoft },
  dashed: { backgroundColor: tokens.colors.surface, borderStyle: "dashed" }
});
