import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

import { tokens } from "@/src/ui/tokens";

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: tokens.colors.actionPrimary,
      tabBarInactiveTintColor: tokens.colors.textSubtle,
      tabBarLabelStyle: styles.label,
      tabBarStyle: styles.bar,
      tabBarIcon: ({ color }) => <Ionicons color={color} name={icons[route.name as keyof typeof icons]} size={tokens.layout.icon.lg} />
    })}>
      <Tabs.Screen name="home" options={{ title: t("tabs.home") }} />
      <Tabs.Screen name="cycles" options={{ title: t("tabs.cycles") }} />
      <Tabs.Screen name="explore" options={{ title: t("tabs.explore") }} />
      <Tabs.Screen name="profile" options={{ title: t("tabs.profile") }} />
    </Tabs>
  );
}

const icons = {
  home: "home-outline",
  cycles: "leaf-outline",
  explore: "compass-outline",
  profile: "person-outline"
} as const;

const styles = StyleSheet.create({
  bar: { backgroundColor: tokens.colors.surface, borderTopColor: tokens.colors.border, borderTopWidth: tokens.layout.border.thin, height: tokens.layout.size.touchTargetLarge + tokens.spacing.xxl, paddingTop: tokens.spacing.xs },
  label: { ...tokens.typography.label, marginBottom: tokens.spacing.xs, textTransform: "uppercase" }
});
