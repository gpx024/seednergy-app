import Ionicons from "@expo/vector-icons/Ionicons";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
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
      tabBarBackground: () => <LinearGradient colors={[tokens.colors.photoA, tokens.colors.photoB]} style={styles.barBackground} />,
      tabBarButton: (props) => <TabButton {...props} bottomInset={bottomInset} />,
      tabBarIcon: ({ color }) => <Ionicons color={color} name={tabConfig.find((tab) => tab.name === route.name)?.icon ?? "ellipse-outline"} size={19} />
    })}>
      {tabConfig.map((tab) => <Tabs.Screen key={tab.name} name={tab.name} options={{ title: t(tab.label) }} />)}
    </Tabs>
  );
}

function TabButton({ accessibilityState, bottomInset, children, onLongPress, onPress }: BottomTabBarButtonProps & { bottomInset: number }) {
  const active = accessibilityState?.selected;
  return (
    <Pressable accessibilityRole="button" accessibilityState={accessibilityState} onLongPress={onLongPress ?? undefined} onPress={onPress ?? undefined} style={({ pressed }) => [styles.item, { paddingBottom: bottomInset }, active && styles.itemActive, pressed && styles.itemPressed]}>
      {active ? <><View style={styles.activeOuterHighlight} /><View style={styles.activeOuterDepth} /><View style={styles.activeRelief}><LinearGradient colors={[tokens.colors.tabActiveA, tokens.colors.tabActiveB]} end={{ x: 1, y: 1 }} start={{ x: 0, y: 0 }} style={StyleSheet.absoluteFill} /><View style={styles.activeTopHighlight} /><View style={styles.activeLeftHighlight} /><View style={styles.activeRightEdge} /><View style={styles.activeBottomEdge} /></View></> : null}
      <View style={styles.itemContent}>{children}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: { backgroundColor: tokens.colors.sand, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, borderTopColor: "rgba(46,42,36,0.10)", borderTopWidth: StyleSheet.hairlineWidth, elevation: 0, overflow: "hidden", paddingBottom: 0, paddingTop: 0, shadowOpacity: 0 },
  barBackground: { ...StyleSheet.absoluteFillObject, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  item: { alignItems: "stretch", flex: 1, justifyContent: "center", minHeight: 58, overflow: "visible", paddingTop: tokens.spacing.xs },
  itemActive: { zIndex: 2 },
  activeOuterHighlight: { backgroundColor: "rgba(255,255,255,0.95)", bottom: 4, left: -7, position: "absolute", right: 7, top: -4, zIndex: 0 },
  activeOuterDepth: { backgroundColor: "rgba(126,116,92,0.58)", bottom: -5, left: 6, position: "absolute", right: -9, top: 5, zIndex: 0 },
  activeRelief: { ...StyleSheet.absoluteFillObject, backgroundColor: tokens.colors.card, zIndex: 1 },
  activeTopHighlight: { backgroundColor: "rgba(255,255,255,0.98)", height: 4, left: 0, position: "absolute", right: 0, top: 0 },
  activeLeftHighlight: { backgroundColor: "rgba(255,255,255,0.82)", bottom: 0, left: 0, position: "absolute", top: 0, width: 4 },
  activeRightEdge: { backgroundColor: "rgba(126,116,92,0.46)", bottom: 0, position: "absolute", right: 0, top: 0, width: 6 },
  activeBottomEdge: { backgroundColor: "rgba(126,116,92,0.36)", bottom: 0, height: 5, left: 0, position: "absolute", right: 0 },
  itemContent: { alignItems: "center", flex: 1, gap: tokens.spacing.xxs, justifyContent: "center", zIndex: 2 },
  itemPressed: { opacity: 0.8 },
  label: { ...tokens.typography.tab, marginTop: 0 }
});
