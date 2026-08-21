import { StyleSheet, Text, TextInput, type TextInputProps, View } from "react-native";

import { tokens } from "@/src/ui/tokens";

interface AppFieldProps extends TextInputProps {
  label: string;
}

export function AppField({ label, ...props }: AppFieldProps) {
  return <View style={styles.group}><Text style={styles.label}>{label}</Text><TextInput placeholderTextColor={tokens.colors.ink34} style={styles.input} {...props} /></View>;
}

const styles = StyleSheet.create({
  group: { gap: tokens.spacing.xs },
  label: { ...tokens.typography.label, color: tokens.colors.oliveLabel, textTransform: "uppercase" },
  input: { minHeight: 50, borderRadius: tokens.radii.field, paddingHorizontal: tokens.spacing.md, backgroundColor: tokens.colors.input, color: tokens.colors.ink, ...tokens.typography.body, ...tokens.elevation.inset }
});
