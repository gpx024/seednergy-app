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
      {active ? <View pointerEvents="none" style={styles.activeRelief}><View style={styles.activeTopHighlight} /><View style={styles.activeLeftHighlight} /><View style={styles.activeRightEdge} /><View style={styles.activeBottomEdge} /></View> : null}
      <View style={[styles.itemContent, active && styles.itemContentActive]}>{children}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: { backgroundColor: "transparent", borderBottomLeftRadius: 30, borderBottomRightRadius: 30, borderTopColor: tokens.colors.border, borderTopWidth: StyleSheet.hairlineWidth, elevation: 0, overflow: "visible", paddingBottom: 0, paddingTop: 0, shadowOpacity: 0 },
  barBackground: { ...StyleSheet.absoluteFillObject, backgroundColor: tokens.colors.tabInactiveSurface, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  item: { alignItems: "stretch", backgroundColor: "transparent", flex: 1, justifyContent: "center", minHeight: 58, overflow: "visible", paddingTop: tokens.spacing.xs },
  itemActive: { zIndex: 10 },
  activeRelief: { backgroundColor: tokens.colors.tabActiveSurface, borderLeftColor: "rgba(255,255,255,0.78)", borderLeftWidth: 1, borderRightColor: "rgba(126,116,92,0.34)", borderRightWidth: 1, borderTopColor: "rgba(255,255,255,0.96)", borderTopLeftRadius: 4, borderTopRightRadius: 4, borderTopWidth: 1, bottom: -1, left: 0, position: "absolute", right: 0, top: -5, zIndex: 1, ...tokens.elevation.tabActive },
  activeTopHighlight: { backgroundColor: "rgba(255,255,255,0.82)", height: 2, left: 1, position: "absolute", right: 1, top: 1 },
  activeLeftHighlight: { backgroundColor: "rgba(255,255,255,0.48)", bottom: 0, left: 1, position: "absolute", top: 2, width: 2 },
  activeRightEdge: { backgroundColor: "rgba(126,116,92,0.22)", bottom: 0, position: "absolute", right: 1, top: 2, width: 3 },
  activeBottomEdge: { backgroundColor: "rgba(126,116,92,0.24)", bottom: 0, height: 3, left: 1, position: "absolute", right: 1 },
  itemContent: { alignItems: "center", flex: 1, gap: tokens.spacing.xxs, justifyContent: "center", zIndex: 2 },
  itemContentActive: { transform: [{ translateY: -2 }] },
  itemPressed: { opacity: 0.8 },
  label: { ...tokens.typography.tab, marginTop: 0 }
});
