import { StyleSheet, View } from "react-native";

import { BrandMark } from "@/src/ui/components/BrandMark";
import { BrandWordmark } from "@/src/ui/components/BrandWordmark";

interface BrandHeaderProps {
  wordmarkWidth?: number;
}

export function BrandHeader({ wordmarkWidth = 96 }: BrandHeaderProps) {
  return <View accessibilityRole="header" style={styles.header}><BrandWordmark width={wordmarkWidth} /><BrandMark width={19} /></View>;
}

const styles = StyleSheet.create({
  header: { alignItems: "flex-start", flexDirection: "row", flexShrink: 0, justifyContent: "space-between" }
});
