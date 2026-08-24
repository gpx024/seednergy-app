import { forwardRef, type ComponentRef } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from "react-native";

import { tokens } from "@/src/ui/tokens";

export type AppButtonVariant = "primary" | "secondary" | "text" | "ghost";

interface AppButtonProps {
  label: string;
  variant?: AppButtonVariant;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export const AppButton = forwardRef<ComponentRef<typeof Pressable>, AppButtonProps>(function AppButton({ label, variant = "primary", onPress, disabled = false, loading = false, accessibilityLabel, style }, ref) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      ref={ref}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [styles.base, variantStyles[variant], isDisabled && styles.disabled, pressed && !isDisabled && pressedStyles[variant], style]}
    >
      {loading ? <ActivityIndicator color={variant === "primary" ? tokens.colors.stone : tokens.colors.olive} /> : <Text maxFontSizeMultiplier={1.8} style={[styles.label, labelStyles[variant]]}>{label}</Text>}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  base: { alignItems: "center", justifyContent: "center", minHeight: tokens.layout.size.touchTargetLarge, paddingHorizontal: tokens.spacing.lg, borderRadius: tokens.radii.button },
  disabled: { boxShadow: "none", opacity: 0.55 },
  label: { ...tokens.typography.button, textAlign: "center" }
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: tokens.colors.olive, ...tokens.elevation.action },
  secondary: { backgroundColor: tokens.colors.card, ...tokens.elevation.raisedMd },
  text: { backgroundColor: "transparent", minHeight: tokens.layout.size.touchTarget },
  ghost: { backgroundColor: "transparent", minHeight: tokens.layout.size.touchTarget }
});

const pressedStyles = StyleSheet.create({
  primary: { backgroundColor: tokens.colors.olivePressed, ...tokens.elevation.raisedSm },
  secondary: { ...tokens.elevation.raisedSm },
  text: { opacity: 0.7 },
  ghost: { opacity: 0.7 }
});

const labelStyles = StyleSheet.create({
  primary: { color: tokens.colors.stone },
  secondary: { color: tokens.colors.ink },
  text: { color: tokens.colors.terracottaText },
  ghost: { color: tokens.colors.ink82 }
});
