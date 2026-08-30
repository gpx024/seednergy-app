import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { BrandMark } from "@/src/ui/components/BrandMark";
import { tokens } from "@/src/ui/tokens";

interface SectionHeaderProps {
  title: string;
}

export function SectionHeader({ title }: SectionHeaderProps) {
  const router = useRouter();
  return <View accessibilityRole="header" style={styles.header}><Text style={styles.title}>{title}</Text><Pressable accessibilityLabel="Open profile" accessibilityRole="button" hitSlop={12} onPress={() => router.push("/(tabs)/profile")} style={({ pressed }) => [styles.mark, pressed && styles.pressed]}><BrandMark width={22} /></Pressable></View>;
}

const styles = StyleSheet.create({
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", minHeight: 42, paddingHorizontal: tokens.spacing.md },
  title: { ...tokens.typography.title, color: tokens.colors.brand },
  mark: { alignItems: "center", height: tokens.layout.size.touchTarget, justifyContent: "center", width: tokens.layout.size.touchTarget },
  pressed: { opacity: 0.72 }
});
