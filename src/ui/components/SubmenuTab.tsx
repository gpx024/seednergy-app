import Ionicons from "@expo/vector-icons/Ionicons";
import { type ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { tokens } from "@/src/ui/tokens";

interface SubmenuTabProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: ComponentProps<typeof Ionicons>["name"];
}

export function SubmenuTab({ label, selected, onPress, icon }: SubmenuTabProps) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={styles.touchTarget}
    >
      <View style={[styles.visual, selected && styles.selectedVisual]}>
        {icon ? <Ionicons color={selected ? tokens.colors.raised : tokens.colors.olive} name={icon} size={16} /> : null}
        <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  touchTarget: { alignItems: "center", flex: 1, justifyContent: "center", minHeight: tokens.layout.size.touchTarget },
  visual: { alignItems: "center", alignSelf: "center", borderRadius: tokens.radii.pill, flexDirection: "row", gap: tokens.spacing.xxs, justifyContent: "center", minHeight: 32, paddingHorizontal: tokens.spacing.sm },
  selectedVisual: { backgroundColor: tokens.colors.olive, ...tokens.elevation.pillOlive },
  label: { fontFamily: "Inter_600SemiBold", fontSize: 13, lineHeight: 17, color: tokens.colors.olive, textAlign: "center" },
  selectedLabel: { color: tokens.colors.raised }
});
