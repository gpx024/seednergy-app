import Ionicons from "@expo/vector-icons/Ionicons";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import { Pressable, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

import { tokens } from "@/src/ui/tokens";

const tabConfig = [
  { name: "home", label: "tabs.home", icon: "home-outline" },
  { name: "cycles", label: "tabs.cycles", icon: "time-outline" },
  { name: "explore", label: "tabs.explore", icon: "search-outline" },
  { name: "profile", label: "tabs.profile", icon: "person-outline" }
] as const;

export default function TabsLayout() {
  const { t } = useTranslation();
  return (
    <Tabs screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: tokens.colors.terracottaText,
      tabBarInactiveTintColor: tokens.colors.ink,
      tabBarLabelStyle: styles.label,
      tabBarStyle: styles.bar,
      tabBarBackground: () => <LinearGradient colors={[tokens.colors.photoA, tokens.colors.photoB]} style={StyleSheet.absoluteFill} />,
      tabBarButton: (props) => <TabButton {...props} />,
      tabBarIcon: ({ color }) => <Ionicons color={color} name={tabConfig.find((tab) => tab.name === route.name)?.icon ?? "ellipse-outline"} size={tokens.layout.icon.md} />
    })}>
      {tabConfig.map((tab) => <Tabs.Screen key={tab.name} name={tab.name} options={{ title: t(tab.label) }} />)}
    </Tabs>
  );
}

function TabButton({ accessibilityState, children, onLongPress, onPress }: BottomTabBarButtonProps) {
  const active = accessibilityState?.selected;
  return <Pressable accessibilityRole="button" accessibilityState={accessibilityState} onLongPress={onLongPress ?? undefined} onPress={onPress ?? undefined} style={({ pressed }) => [styles.item, active && styles.itemActive, pressed && styles.itemPressed]}>{children}</Pressable>;
}

const styles = StyleSheet.create({
  bar: { backgroundColor: tokens.colors.sand, borderTopWidth: 0, height: 82, elevation: 0, shadowOpacity: 0 },
  item: { alignItems: "center", flex: 1, gap: 7, justifyContent: "center", minHeight: 68, paddingBottom: tokens.spacing.sm, paddingTop: tokens.spacing.sm },
  itemActive: { backgroundColor: tokens.colors.card, ...tokens.elevation.raisedMd },
  itemPressed: { opacity: 0.8 },
  label: { ...tokens.typography.tab, marginTop: 0 }
});
