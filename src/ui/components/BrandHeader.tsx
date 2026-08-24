import { StyleSheet, View } from "react-native";

import { BrandMark } from "@/src/ui/components/BrandMark";
import { BrandWordmark } from "@/src/ui/components/BrandWordmark";
import { tokens } from "@/src/ui/tokens";

interface BrandHeaderProps {
  wordmarkWidth?: number;
}

export function BrandHeader({ wordmarkWidth = 126 }: BrandHeaderProps) {
  return <View accessibilityRole="header" style={styles.header}><BrandWordmark width={wordmarkWidth} /><BrandMark width={22} /></View>;
}

const styles = StyleSheet.create({
  header: { alignItems: "center", flexDirection: "row", flexShrink: 0, justifyContent: "space-between", minHeight: tokens.layout.size.touchTarget }
});
