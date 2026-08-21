import { type PropsWithChildren } from "react";
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { tokens } from "@/src/ui/tokens";

interface ScreenContainerProps extends PropsWithChildren {
  scroll?: boolean;
  inverted?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}

export function ScreenContainer({ children, scroll = false, inverted = false, contentStyle }: ScreenContainerProps) {
  const content = <View style={[styles.content, contentStyle]}>{children}</View>;
  return <SafeAreaView edges={["top", "left", "right"]} style={[styles.safeArea, inverted && styles.inverted]}>{scroll ? <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">{content}</ScrollView> : content}</SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: tokens.colors.canvas },
  inverted: { backgroundColor: tokens.colors.forest },
  content: { flex: 1, paddingHorizontal: tokens.spacing.gutter, paddingVertical: tokens.spacing.md },
  scrollContent: { flexGrow: 1 }
});
