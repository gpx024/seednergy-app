import { type PropsWithChildren } from "react";
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

import { tokens } from "@/src/ui/tokens";

interface ScreenContainerProps extends PropsWithChildren {
  scroll?: boolean;
  inverted?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  includeBottomSafeArea?: boolean;
}

export function ScreenContainer({ children, scroll = false, inverted = false, contentStyle, includeBottomSafeArea = true }: ScreenContainerProps) {
  const content = <View style={[styles.content, scroll && styles.scrollableContent, contentStyle]}>{children}</View>;
  const edges: Edge[] = includeBottomSafeArea ? ["top", "bottom", "left", "right"] : ["top", "left", "right"];
  return <SafeAreaView edges={edges} style={[styles.safeArea, inverted && styles.inverted]}>{scroll ? <ScrollView contentContainerStyle={styles.scrollContent} contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled">{content}</ScrollView> : content}</SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: tokens.colors.canvas },
  inverted: { backgroundColor: tokens.colors.forest },
  content: { flex: 1, paddingHorizontal: tokens.spacing.gutter, paddingVertical: tokens.spacing.md },
  scrollableContent: { flex: undefined, flexGrow: 1 },
  scrollContent: { flexGrow: 1 }
});
