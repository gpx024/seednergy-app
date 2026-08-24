import { StyleSheet, View } from "react-native";

import { BrandMark } from "@/src/ui/components/BrandMark";
import { BrandWordmark } from "@/src/ui/components/BrandWordmark";

interface BrandHeaderProps {
  wordmarkWidth?: number;
  markWidth?: number;
}

export function BrandHeader({ wordmarkWidth = 88, markWidth = 36 }: BrandHeaderProps) {
  return <View accessibilityRole="header" style={styles.header}><BrandWordmark width={wordmarkWidth} /><BrandMark width={markWidth} /></View>;
}

const styles = StyleSheet.create({
  header: { alignItems: "flex-start", flexDirection: "row", flexShrink: 0, justifyContent: "space-between", minHeight: 58, width: "100%" }
});
