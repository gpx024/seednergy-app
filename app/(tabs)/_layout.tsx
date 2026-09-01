import Ionicons from "@expo/vector-icons/Ionicons";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { Redirect, Tabs } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { tokens } from "@/src/ui/tokens";
import { useAuth } from "@/src/presentation/auth/AuthProvider";

const tabConfig = [
  { name: "home", label: "tabs.home", icon: "home-outline" },
  { name: "cycles", label: "tabs.cycles", icon: "time-outline" },
  { name: "explore", label: "tabs.explore", icon: "search-outline" },
  { name: "garden", label: "tabs.garden", icon: "leaf-outline" }
] as const;

export default function TabsLayout() {
  const { t } = useTranslation();
  const { loading, session } = useAuth();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, tokens.spacing.xs);
  if (loading) return null;
  if (!session) return <Redirect href="/(onboarding)/sign-in" />;
  return (
    <Tabs screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: tokens.colors.tabActiveContent,
      tabBarInactiveTintColor: tokens.colors.brand,
      tabBarLabelStyle: styles.label,
      tabBarStyle: [styles.bar, { height: 58 + bottomInset }],
      tabBarBackground: () => <View style={styles.barBackground} />,
      tabBarButton: (props) => <TabButton {...props} bottomInset={bottomInset} />,
      tabBarIcon: ({ color }) => <Ionicons color={color} name={tabConfig.find((tab) => tab.name === route.name)?.icon ?? "ellipse-outline"} size={19} />
    })}>
      {tabConfig.map((tab) => <Tabs.Screen key={tab.name} name={tab.name} options={{ title: t(tab.label) }} />)}
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}

function TabButton({ accessibilityState, bottomInset, children, onLongPress, onPress }: BottomTabBarButtonProps & { bottomInset: number }) {
  const active = accessibilityState?.selected;
  return (
    <Pressable accessibilityRole="button" accessibilityState={accessibilityState} onLongPress={onLongPress ?? undefined} onPress={onPress ?? undefined} style={({ pressed }) => [styles.item, { paddingBottom: bottomInset }, active && styles.itemActive, pressed && styles.itemPressed]}>
      {active ? <View pointerEvents="none" style={[styles.activeRelief, { bottom: bottomInset + tokens.spacing.xxs }]} /> : null}
      <View style={[styles.itemContent, active && styles.itemContentActive]}>{children}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: { backgroundColor: "transparent", borderBottomLeftRadius: 30, borderBottomRightRadius: 30, borderTopColor: tokens.colors.border, borderTopWidth: StyleSheet.hairlineWidth, elevation: 0, overflow: "visible", paddingBottom: 0, paddingTop: 0 },
  barBackground: { ...StyleSheet.absoluteFillObject, backgroundColor: tokens.colors.tabInactiveSurface, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, ...tokens.elevation.raisedSm },
  item: { alignItems: "stretch", backgroundColor: "transparent", flex: 1, justifyContent: "center", minHeight: 58, overflow: "visible", paddingTop: tokens.spacing.xs },
  itemActive: { zIndex: 10 },
  activeRelief: {
    ...tokens.elevation.inset,
    backgroundColor: tokens.colors.tabActiveSurface,
    borderBottomColor: "rgba(255,255,255,0.78)",
    borderBottomWidth: 1.5,
    borderLeftColor: "rgba(126,116,92,0.36)",
    borderLeftWidth: 2,
    borderRadius: tokens.radii.card,
    borderRightColor: "rgba(255,255,255,0.68)",
    borderRightWidth: 2,
    borderTopColor: "rgba(126,116,92,0.48)",
    borderTopWidth: 2,
    left: tokens.spacing.xxs,
    position: "absolute",
    right: tokens.spacing.xxs,
    top: tokens.spacing.xxs,
    zIndex: 1
  },
  itemContent: { alignItems: "center", flex: 1, gap: tokens.spacing.xxs, justifyContent: "center", zIndex: 2 },
  itemContentActive: {},
  itemPressed: { opacity: 0.8 },
  label: { ...tokens.typography.tab, marginTop: 0 }
});
