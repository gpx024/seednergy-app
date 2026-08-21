import { type PropsWithChildren } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { tokens } from "@/src/ui/tokens";

type AppCardVariant = "default" | "hero" | "nested" | "muted" | "dashed";

interface AppCardProps extends PropsWithChildren {
  variant?: AppCardVariant;
  style?: StyleProp<ViewStyle>;
}

export function AppCard({ children, variant = "default", style }: AppCardProps) {
  return <View style={[styles.base, variantStyles[variant], style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: { backgroundColor: tokens.colors.card, borderRadius: tokens.radii.card, padding: tokens.spacing.cardPadding }
});

const variantStyles = StyleSheet.create({
  default: { ...tokens.elevation.raisedMd },
  hero: { borderRadius: tokens.radii.media, ...tokens.elevation.raisedLg },
  nested: { backgroundColor: tokens.colors.terracottaPanel, borderRadius: tokens.radii.button, ...tokens.elevation.nested },
  muted: { ...tokens.elevation.raisedSm },
  dashed: { ...tokens.elevation.raisedMd }
});
