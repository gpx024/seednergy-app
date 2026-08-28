import { StyleSheet, Text, View } from "react-native";

import { BrandMark } from "@/src/ui/components/BrandMark";
import { tokens } from "@/src/ui/tokens";

interface SectionHeaderProps {
  title: string;
}

export function SectionHeader({ title }: SectionHeaderProps) {
  return <View accessibilityRole="header" style={styles.header}><Text style={styles.title}>{title}</Text><BrandMark width={22} /></View>;
}

const styles = StyleSheet.create({
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", minHeight: 42, paddingHorizontal: tokens.spacing.md },
  title: { ...tokens.typography.title, color: tokens.colors.brand }
});
