import Ionicons from "@expo/vector-icons/Ionicons";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import { Pressable, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { tokens } from "@/src/ui/tokens";

const tabConfig = [
  { name: "home", label: "tabs.home", icon: "home-outline" },
  { name: "cycles", label: "tabs.cycles", icon: "time-outline" },
  { name: "explore", label: "tabs.explore", icon: "search-outline" },
  { name: "profile", label: "tabs.profile", icon: "person-outline" }
] as const;

export default function TabsLayout() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, tokens.spacing.xs);
  return (
    <Tabs screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: tokens.colors.terracottaText,
      tabBarInactiveTintColor: tokens.colors.ink,
      tabBarLabelStyle: styles.label,
      tabBarStyle: [styles.bar, { height: 58 + bottomInset }],
      tabBarBackground: () => <LinearGradient colors={[tokens.colors.photoA, tokens.colors.photoB]} style={StyleSheet.absoluteFill} />,
      tabBarButton: (props) => <TabButton {...props} bottomInset={bottomInset} />,
      tabBarIcon: ({ color }) => <Ionicons color={color} name={tabConfig.find((tab) => tab.name === route.name)?.icon ?? "ellipse-outline"} size={tokens.layout.icon.md} />
    })}>
      {tabConfig.map((tab) => <Tabs.Screen key={tab.name} name={tab.name} options={{ title: t(tab.label) }} />)}
    </Tabs>
  );
}

function TabButton({ accessibilityState, bottomInset, children, onLongPress, onPress }: BottomTabBarButtonProps & { bottomInset: number }) {
  const active = accessibilityState?.selected;
  return <Pressable accessibilityRole="button" accessibilityState={accessibilityState} onLongPress={onLongPress ?? undefined} onPress={onPress ?? undefined} style={({ pressed }) => [styles.item, { paddingBottom: bottomInset }, active && styles.itemActive, pressed && styles.itemPressed]}>{active ? <LinearGradient colors={[tokens.colors.tabActiveA, tokens.colors.tabActiveB]} style={StyleSheet.absoluteFill} /> : null}{children}</Pressable>;
}

const styles = StyleSheet.create({
  bar: { backgroundColor: tokens.colors.sand, borderTopWidth: 0, elevation: 0, paddingBottom: 0, paddingTop: 0, shadowOpacity: 0 },
  item: { alignItems: "center", flex: 1, gap: tokens.spacing.xxs, justifyContent: "center", minHeight: 58, overflow: "visible", paddingTop: tokens.spacing.xs },
  itemActive: { ...tokens.elevation.tabActive },
  itemPressed: { opacity: 0.8 },
  label: { ...tokens.typography.tab, marginTop: 0 }
});
