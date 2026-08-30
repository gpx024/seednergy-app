import Ionicons from "@expo/vector-icons/Ionicons";
import { Image, StyleSheet, View } from "react-native";

import { tokens } from "@/src/ui/tokens";

interface ProfileAvatarProps {
  showEditHint?: boolean;
  size?: number;
  uri?: string | null;
}

export function ProfileAvatar({ showEditHint = false, size = 46, uri }: ProfileAvatarProps) {
  const radius = size / 2;
  return uri
    ? <Image accessibilityLabel="Profile photo" source={{ uri }} style={{ borderRadius: radius, height: size, width: size }} />
    : <View accessibilityLabel="Profile photo placeholder" style={[styles.fallback, { borderRadius: radius, height: size, width: size }]}><Ionicons color={tokens.colors.tabActiveContent} name="person-outline" size={Math.max(20, size * 0.42)} />{showEditHint ? <View style={[styles.cameraBadge, { borderRadius: Math.max(7, size * 0.15), height: Math.max(14, size * 0.3), width: Math.max(14, size * 0.3) }]}><Ionicons color={tokens.colors.raised} name="camera-outline" size={Math.max(9, size * 0.18)} /></View> : null}</View>;
}

const styles = StyleSheet.create({
  fallback: { alignItems: "center", backgroundColor: tokens.colors.raised, justifyContent: "center", position: "relative" },
  cameraBadge: { alignItems: "center", backgroundColor: tokens.colors.olive, bottom: 0, justifyContent: "center", position: "absolute", right: 0, ...tokens.elevation.raisedXs }
});
