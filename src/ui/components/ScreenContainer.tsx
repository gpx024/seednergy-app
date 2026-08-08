import { type PropsWithChildren } from "react";
import { ScrollView, StyleSheet, View, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { tokens } from "@/src/ui/tokens";

interface ScreenContainerProps extends PropsWithChildren {
  scroll?: boolean;
  contentStyle?: ViewStyle;
}

export function ScreenContainer({ children, scroll = false, contentStyle }: ScreenContainerProps) {
  const content = <View style={[styles.content, contentStyle]}>{children}</View>;
  return <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>{scroll ? <ScrollView contentContainerStyle={styles.scrollContent}>{content}</ScrollView> : content}</SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: tokens.colors.background },
  content: { flex: 1, padding: tokens.spacing.xl },
  scrollContent: { flexGrow: 1 }
});
