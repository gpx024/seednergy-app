import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { tokens } from "@/src/ui/tokens";

interface OptionRowProps {
  title: string;
  description?: string;
  icon: keyof typeof Ionicons.glyphMap;
  selected?: boolean;
  onPress?: () => void;
}

export function OptionRow({ title, description, icon, selected = false, onPress }: OptionRowProps) {
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={onPress} style={({ pressed }) => [styles.row, selected && styles.selected, pressed && styles.pressed]}>
      <View style={styles.icon}><Ionicons color={tokens.colors.terracottaText} name={icon} size={28} /></View>
      <View style={styles.copy}><Text maxFontSizeMultiplier={1.8} style={styles.title}>{title}</Text>{description ? <Text maxFontSizeMultiplier={2} style={styles.description}>{description}</Text> : null}</View>
      <View style={[styles.radio, selected && styles.radioSelected]}>{selected ? <View style={styles.radioDot} /> : null}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 76, alignItems: "center", flexDirection: "row", gap: tokens.spacing.sm, padding: tokens.spacing.md, borderRadius: tokens.radii.card, backgroundColor: tokens.colors.card, ...tokens.elevation.raisedSm },
  selected: { ...tokens.elevation.raisedMd },
  pressed: { opacity: 0.8 },
  icon: { alignItems: "center", justifyContent: "center", height: 40, width: 40 },
  copy: { flex: 1, gap: tokens.spacing.xxs },
  title: { ...tokens.typography.panelHeadline, color: tokens.colors.forest },
  description: { ...tokens.typography.caption, color: tokens.colors.ink64 },
  radio: { alignItems: "center", justifyContent: "center", height: 22, width: 22, borderRadius: 11, backgroundColor: tokens.colors.card, ...tokens.elevation.inset },
  radioSelected: { backgroundColor: tokens.colors.olive },
  radioDot: { height: 7, width: 7, borderRadius: 4, backgroundColor: tokens.colors.stone }
});
