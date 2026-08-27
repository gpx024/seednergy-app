import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { BrandMark } from "@/src/ui/components/BrandMark";
import { tokens } from "@/src/ui/tokens";

interface BackHeaderProps {
  backLabel?: string;
  center?: ReactNode;
  rightAccessory?: ReactNode;
}

export function BackHeader({ backLabel = "Back", center, rightAccessory }: BackHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <Pressable accessibilityLabel={backLabel} accessibilityRole="button" hitSlop={12} onPress={() => router.back()} style={styles.action}>
        <Ionicons color={tokens.colors.ink} name="arrow-back" size={tokens.layout.icon.lg} />
      </Pressable>
      <View style={styles.center}>{center}</View>
      <View style={styles.end}>
        {rightAccessory}
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.mark}>
          <BrandMark width={22} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", flexDirection: "row", minHeight: tokens.layout.size.touchTarget, width: "100%" },
  action: { alignItems: "center", height: tokens.layout.size.touchTarget, justifyContent: "center", width: tokens.layout.size.touchTarget },
  center: { alignItems: "center", flex: 1, justifyContent: "center", minWidth: 0 },
  end: { alignItems: "center", flexDirection: "row", gap: tokens.spacing.xs, justifyContent: "flex-end", minHeight: tokens.layout.size.touchTarget, minWidth: tokens.layout.size.touchTarget },
  mark: { alignItems: "center", height: tokens.layout.size.touchTarget, justifyContent: "center", width: 32 }
});
