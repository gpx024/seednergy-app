import { forwardRef, type ComponentRef } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from "react-native";

import { tokens } from "@/src/ui/tokens";

export type AppButtonVariant = "primary" | "secondary" | "ghost";

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
      style={({ pressed }) => [styles.base, variantStyles[variant], isDisabled && styles.disabled, pressed && !isDisabled && styles.pressed, style]}
    >
      {loading ? <ActivityIndicator color={variant === "primary" ? tokens.colors.actionPrimaryText : tokens.colors.actionPrimary} /> : <Text style={[styles.label, labelStyles[variant]]}>{label}</Text>}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  base: { alignItems: "center", justifyContent: "center", minHeight: tokens.layout.size.touchTargetLarge, paddingHorizontal: tokens.spacing.xl, borderRadius: tokens.radii.pill },
  disabled: { opacity: 0.48 },
  pressed: { opacity: 0.82 },
  label: { ...tokens.typography.button, textAlign: "center" }
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: tokens.colors.actionPrimary },
  secondary: { backgroundColor: tokens.colors.surface, borderColor: tokens.colors.border, borderWidth: tokens.layout.border.standard },
  ghost: { backgroundColor: "transparent" }
});

const labelStyles = StyleSheet.create({
  primary: { color: tokens.colors.actionPrimaryText },
  secondary: { color: tokens.colors.textPrimary },
  ghost: { color: tokens.colors.textSecondary }
});
